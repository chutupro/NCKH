from fastapi import FastAPI, File, UploadFile, Form
from typing import Optional, List, Dict, Any
from PIL import Image
import io, json, numpy as np, onnxruntime as ort
import torchvision.transforms as T
import re, time, uuid
import sys
import os
import warnings

# Suppress transformers warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Import NSFW detector từ cùng thư mục
from nsfw_detector import NSFWDetector

# Import Title Generator
from title_generator import generate_titles

# AI Caption model - Florence-2-large for vivid descriptions
from transformers import AutoProcessor, AutoModelForCausalLM
import torch

app = FastAPI(title="AI Title Service")

# Load classifier (ONNX) + meta
META = json.load(open("models/meta.json", "r", encoding="utf-8"))
LABELS = META["labels"]; THRESH = float(META.get("threshold", 0.5))
ORT_SESS = ort.InferenceSession("models/cls.onnx", providers=["CPUExecutionProvider"])
TF = T.Compose([T.Resize((224,224)), T.ToTensor()])

# Load NSFW detector
NSFW_DETECTOR = NSFWDetector("LukeJacob2023/nsfw-image-detector")

# AI Caption - Sử dụng BLIP-base (nhẹ hơn, phù hợp với RAM thấp)
try:
    from transformers import BlipProcessor, BlipForConditionalGeneration
    
    # BLIP-base chỉ ~1GB, nhẹ hơn BLIP-2 rất nhiều
    CAP_PROCESSOR = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    CAP_MODEL = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    CAPTION_ENABLED = True
except Exception as e:
    print(f"⚠️  Không thể tải BLIP: {e}")
    CAP_MODEL = None
    CAP_PROCESSOR = None
    CAPTION_ENABLED = False

# Translator EN->VI - Sử dụng MarianMT (nhẹ, nhanh)
try:
    from transformers import MarianMTModel, MarianTokenizer
    
    # Helsinki-NLP MarianMT cho English -> Vietnamese
    TRANSLATOR_MODEL_NAME = "Helsinki-NLP/opus-mt-en-vi"
    TRANSLATOR_TOKENIZER = MarianTokenizer.from_pretrained(TRANSLATOR_MODEL_NAME)
    TRANSLATOR_MODEL = MarianMTModel.from_pretrained(TRANSLATOR_MODEL_NAME)
    TRANSLATOR_ENABLED = True
except Exception as e:
    print(f"⚠️  Không thể tải MarianMT: {e}")
    TRANSLATOR_MODEL = None
    TRANSLATOR_TOKENIZER = None
    TRANSLATOR_ENABLED = False

# Thông báo khởi động xong
print("✅ All models ready")

# Từ điển dịch EN->VI để tạo caption tiếng Việt tự nhiên
KW_EN_VI = {
  # Thiên nhiên
  "mountain": "núi", "mountains": "những ngọn núi", "hill": "đồi", "hills": "những ngọn đồi",
  "river": "dòng sông", "lake": "hồ", "sea": "biển", "ocean": "đại dương",
  "beach": "bãi biển", "forest": "khu rừng", "tree": "cây", "trees": "những cây",
  "field": "cánh đồng", "fields": "những cánh đồng", "rice": "lúa", "rice field": "cánh đồng lúa",
  "sun": "mặt trời", "sunshine": "ánh nắng", "shining": "chiếu sáng", "bright": "sáng",
  "sky": "bầu trời", "cloud": "mây", "clouds": "những đám mây",
  
  # Kiến trúc & Di sản
  "temple": "đền chùa", "church": "nhà thờ", "cathedral": "nhà thờ lớn",
  "bridge": "cây cầu", "building": "tòa nhà", "buildings": "những tòa nhà",
  "house": "ngôi nhà", "houses": "những ngôi nhà", "village": "làng", "town": "thị trấn",
  "city": "thành phố", "ancient": "cổ", "old": "cũ", "traditional": "truyền thống",
  "monument": "di tích", "architecture": "kiến trúc", "pagoda": "chùa",
  
  # Văn hóa & Con người
  "festival": "lễ hội", "market": "chợ", "people": "người dân", "person": "người",
  "woman": "phụ nữ", "man": "đàn ông", "child": "trẻ em", "children": "những đứa trẻ",
  "family": "gia đình", "group": "nhóm", "crowd": "đám đông",
  
  # Màu sắc & Trạng thái
  "green": "xanh lá", "blue": "xanh dương", "red": "đỏ", "yellow": "vàng",
  "white": "trắng", "black": "đen", "beautiful": "đẹp", "peaceful": "yên bình",
  "quiet": "yên tĩnh", "busy": "nhộn nhịp", "crowded": "đông đúc",
  
  # Giới từ & Động từ
  "over": "trên", "under": "dưới", "beside": "bên cạnh", "near": "gần",
  "in": "trong", "on": "trên", "at": "tại", "with": "với",
  "walking": "đang đi bộ", "standing": "đang đứng", "sitting": "đang ngồi",
  "playing": "đang chơi", "working": "đang làm việc"
}

THEME_PREFIX = {
  "Heritage & Architecture": "Di sản & Kiến trúc",
  "Culture & Art": "Văn hoá & Nghệ thuật",
  "Nature & Landscape": "Thiên nhiên & Cảnh quan",
  "People & Events": "Con người & Sự kiện"
}

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

def sigmoid(x): return 1/(1+np.exp(-x))

def translate_caption_to_vi(caption_en: str) -> str:
    """Dịch nhanh caption tiếng Anh sang tiếng Việt bằng từ điển"""
    if not caption_en:
        return ""
    
    # Lowercase để dễ match
    caption_lower = caption_en.lower()
    caption_vi = caption_en
    
    # Thay thế các từ khóa có trong từ điển
    for en_word, vi_word in KW_EN_VI.items():
        # Thay thế whole word
        import re
        pattern = r'\b' + re.escape(en_word) + r'\b'
        caption_vi = re.sub(pattern, vi_word, caption_vi, flags=re.IGNORECASE)
    
    # Các cụm từ thường gặp
    replacements = {
        "a photo of": "Ảnh chụp",
        "an image of": "Hình ảnh",
        "shows": "cho thấy",
        "showing": "đang hiển thị",
        "with": "với",
        "and": "và",
        "in the": "trong",
        "on the": "trên",
        "at the": "tại",
        "near the": "gần"
    }
    
    for en_phrase, vi_phrase in replacements.items():
        caption_vi = re.sub(r'\b' + re.escape(en_phrase) + r'\b', vi_phrase, caption_vi, flags=re.IGNORECASE)
    
    # Làm sạch và viết hoa chữ cái đầu
    caption_vi = caption_vi.strip()
    if caption_vi:
        caption_vi = caption_vi[0].upper() + caption_vi[1:]
    
    return caption_vi

def translate_en_to_vi(text_en: str) -> str:
    """Dịch tiếng Anh sang tiếng Việt bằng MarianMT"""
    if not TRANSLATOR_ENABLED or TRANSLATOR_MODEL is None or TRANSLATOR_TOKENIZER is None:
        return text_en  # Giữ nguyên tiếng Anh nếu không có translator
    
    try:
        # Tokenize và dịch
        inputs = TRANSLATOR_TOKENIZER(text_en, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            translated = TRANSLATOR_MODEL.generate(**inputs, max_new_tokens=100)
        
        # Decode kết quả
        text_vi = TRANSLATOR_TOKENIZER.decode(translated[0], skip_special_tokens=True).strip()
        
        # Viết hoa chữ cái đầu
        if text_vi:
            text_vi = text_vi[0].upper() + text_vi[1:] if len(text_vi) > 1 else text_vi.upper()
        
        return text_vi if text_vi else text_en
        
    except Exception as e:
        print(f"⚠️  Lỗi khi dịch: {e}")
        return text_en

def generate_caption_with_blip2(pil: Image.Image) -> tuple:
    """Tạo caption bằng BLIP AI model và dịch sang tiếng Việt
    
    Returns:
        tuple: (caption_en, caption_vi)
    """
    if not CAPTION_ENABLED or CAP_MODEL is None or CAP_PROCESSOR is None:
        return None, None
    
    try:
        # Process image
        inputs = CAP_PROCESSOR(images=pil, return_tensors="pt")
        
        # Move to same device as model if GPU available
        if torch.cuda.is_available():
            inputs = {k: v.to(CAP_MODEL.device) for k, v in inputs.items()}
        
        # Generate caption
        with torch.no_grad():
            generated_ids = CAP_MODEL.generate(
                **inputs,
                max_new_tokens=50,  # Caption ngắn gọn
                num_beams=3,
                early_stopping=True
            )
        
        # Decode caption tiếng Anh
        caption_en = CAP_PROCESSOR.decode(generated_ids[0], skip_special_tokens=True).strip()
        
        # Viết hoa chữ cái đầu nếu chưa có
        if caption_en and not caption_en[0].isupper():
            caption_en = caption_en[0].upper() + caption_en[1:]
        
        # Dịch sang tiếng Việt
        caption_vi = translate_en_to_vi(caption_en)
        
        return caption_en, caption_vi
        
    except Exception as e:
        print(f"⚠️  Lỗi khi tạo caption với BLIP: {e}")
        return None, None

def detect_people_in_image(pil: Image.Image) -> bool:
    """Phát hiện sự hiện diện của con người trong ảnh với độ chính xác cao hơn."""
    try:
        # Resize ảnh để phân tích nhanh
        small_img = pil.resize((128, 128))
        
        # Chuyển sang RGB để phân tích màu da chính xác hơn
        rgb_img = small_img.convert('RGB')
        pixels = list(rgb_img.getdata())
        
        # Phân tích màu da người với nhiều điều kiện
        skin_pixels = 0
        total_pixels = len(pixels)
        
        for r, g, b in pixels:
            # Điều kiện 1: Da người bình thường
            normal_skin = (r > 95 and g > 40 and b > 20 and 
                          r > g and g > b and 
                          abs(r - g) > 15 and 
                          r > 60 and g > 30 and b > 15)
            
            # Điều kiện 2: Da người bị biến dạng màu (xanh lục/vàng)
            distorted_skin = (g > 80 and r > 60 and b < 100 and 
                             abs(g - r) < 50 and 
                             g > b and r > b)
            
            # Điều kiện 3: Da người tối màu
            dark_skin = (r > 40 and g > 30 and b > 20 and 
                        r > g and g > b and 
                        r < 120 and g < 100 and b < 80)
            
            if normal_skin or distorted_skin or dark_skin:
                skin_pixels += 1
        
        skin_ratio = skin_pixels / total_pixels
        
        # Giảm ngưỡng cho ảnh chất lượng thấp (từ 25% xuống 15%)
        # Và giảm số pixel tối thiểu (từ 1000 xuống 500)
        return skin_ratio > 0.15 and skin_pixels > 500
        
    except:
        return False

def generate_caption_vi(pil: Image.Image, predicted_labels: List[str] = None, confidence_scores: List[float] = None) -> str:
    """Tạo caption tiếng Việt chuyên nghiệp với 3 phiên bản khác nhau."""
    import random
    
    width, height = pil.size
    aspect_ratio = width / height
    
    # Phân tích màu sắc và ánh sáng
    try:
        small_img = pil.resize((64, 64))
        colors = small_img.getcolors(maxcolors=256*256*256)
        
        color_analysis = {
            "dominant": "đa dạng",
            "brightness": "trung bình",
            "mood": "trung tính"
        }
        
        if colors:
            dominant_color = max(colors, key=lambda x: x[0])[1]
            r, g, b = dominant_color
            
            # Xác định màu chủ đạo và tâm trạng
            if r > 200 and g < 100 and b < 100:
                color_analysis["dominant"] = "đỏ"
                color_analysis["mood"] = "ấm áp"
            elif g > 200 and r < 100 and b < 100:
                color_analysis["dominant"] = "xanh lá"
                color_analysis["mood"] = "tươi mát"
            elif b > 200 and r < 100 and g < 100:
                color_analysis["dominant"] = "xanh dương"
                color_analysis["mood"] = "thanh bình"
            elif r > 200 and g > 200 and b < 100:
                color_analysis["dominant"] = "vàng"
                color_analysis["mood"] = "rực rỡ"
            elif r > 150 and g > 150 and b > 150:
                color_analysis["dominant"] = "sáng"
                color_analysis["brightness"] = "rực rỡ"
            elif r < 100 and g < 100 and b < 100:
                color_analysis["dominant"] = "tối"
                color_analysis["brightness"] = "dịu nhẹ"
    except:
        pass
    
    # Phát hiện con người trong ảnh (với độ chính xác cao hơn)
    has_people = detect_people_in_image(pil)
    
    # Kiểm tra confidence scores
    low_confidence = False
    if confidence_scores and len(confidence_scores) > 0:
        max_confidence = max(confidence_scores)
        low_confidence = max_confidence < 0.6  # Giảm ngưỡng xuống 60%
    
    # Chỉ override khi thực sự chắc chắn có người VÀ model không nhận ra
    if (has_people and 
        predicted_labels and 
        "People & Events" not in predicted_labels and 
        not low_confidence):
        # Chỉ override khi confidence của People & Events thấp hơn 0.3
        people_scores = [s for n, s in zip(predicted_labels, confidence_scores) if n == "People & Events"]
        if not people_scores or people_scores[0] < 0.3:
            predicted_labels = ["People & Events"]
    
    # Xác định loại ảnh
    if aspect_ratio > 1.5:
        image_type = "wide"
    elif aspect_ratio < 0.7:
        image_type = "tall"
    else:
        image_type = "square"
    
    # Template captions chuyên nghiệp theo 3 phong cách
    # Template caption ngắn gọn (40-60 ký tự)
    professional_templates = {
        "Nature & Landscape": [
            "Thiên nhiên hùng vĩ",
            "Cảnh quan thiên nhiên đẹp",
            "Khung cảnh thiên nhiên",
            "Thiên nhiên hoang sơ"
        ],
        "Heritage & Architecture": [
            "Kiến trúc cổ kính",
            "Di sản văn hóa",
            "Công trình lịch sử",
            "Kiến trúc truyền thống"
        ],
        "Culture & Art": [
            "Văn hóa sôi động",
            "Không gian nghệ thuật",
            "Văn hóa truyền thống",
            "Nghệ thuật đặc sắc"
        ],
        "People & Events": [
            "Khoảnh khắc đáng nhớ",
            "Cộng đồng gắn kết",
            "Sự kiện ý nghĩa",
            "Con người và hoạt động"
        ]
    }
    
    # Chọn template dựa trên predicted labels
    if predicted_labels:
        for label in predicted_labels:
            if label in professional_templates:
                base_caption = random.choice(professional_templates[label])
                break
        else:
            # Fallback
            base_caption = random.choice([
                "Khung cảnh đẹp",
                "Cảnh quan ấn tượng",
                "Không gian tuyệt vời"
            ])
    else:
        base_caption = random.choice([
            "Khung cảnh đẹp",
            "Cảnh quan ấn tượng",
            "Không gian tuyệt vời"
        ])
    
    # Caption ngắn gọn, không thêm màu sắc để tránh rườm rà
    
    return base_caption

def fuse_titles(top_labels: List[str], cap_vi: str) -> List[str]:
    """Ghép nhãn + caption thành 2-3 tiêu đề gợi ý."""
    # tiền tố theo nhãn (tối đa 1-2 nhãn nổi trội)
    prefixes = [THEME_PREFIX.get(x, x) for x in top_labels[:2]]
    pfx = " • ".join(prefixes) if prefixes else ""
    base = cap_vi
    base = re.sub(r"(?i)\b(hình ảnh|ảnh|a photo of)\b", "", base).strip()
    base = re.sub(r"\s+", " ", base)

    titles = []
    if pfx and base:
        titles.append(f"{pfx}: {base}")
    if base:
        titles.append(base)
        short = " ".join(base.split()[:8])
        if short not in titles: titles.append(short)

    # khử trùng lặp/ ký tự thừa
    seen=set(); out=[]
    for t in titles:
        t = t.strip(" -•:–")
        if t and t.lower() not in seen:
            out.append(t); seen.add(t.lower())
    return out[:3] if out else ["Khoảnh khắc đáng nhớ"]

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    override_labels_json: Optional[str] = Form(None),  # nếu muốn gửi danh sách label riêng
    generate_title: Optional[bool] = Form(True)  # có tạo title hay không (mặc định: có)
) -> Dict[str, Any]:
    image_id = str(uuid.uuid4())
    raw = await file.read()
    pil = Image.open(io.BytesIO(raw)).convert("RGB")

    # Bước 1: Kiểm tra NSFW trước
    # print(f"🔍 [Image {image_id}] Đang kiểm tra NSFW...")  # Bỏ log chi tiết
    nsfw_result = NSFW_DETECTOR.predict_single_image(pil)
    
    # Xử lý theo mức độ vi phạm
    if nsfw_result['level'] == 'severe':
        # Chặn hoàn toàn - không chạy classifier
        print(f"🚫 [Image {image_id}] Ảnh bị chặn - mức độ nghiêm trọng")
        return {
            "imageId": image_id,
            "nsfw_check": {
                "predicted_label": nsfw_result['predicted_label'],
                "is_violation": nsfw_result['is_violation'],
                "level": nsfw_result['level'],
                "message": nsfw_result['message']
            },
            "action": "blocked"
        }
    
    elif nsfw_result['level'] == 'mild':
        # Cảnh báo nhưng vẫn chạy classifier (bỏ log)
        pass  # Mild warning, continue processing silently
    
    # Bước 2: Chạy classifier (chỉ khi không bị chặn)
    # print(f"🏷️  [Image {image_id}] Đang phân loại ảnh...")  # Bỏ log chi tiết
    x = TF(pil).unsqueeze(0).numpy()
    logits = ORT_SESS.run(["logits"], {"input": x})[0][0]
    probs = sigmoid(logits).tolist()

    # labels dùng meta mặc định, có thể override
    labels = json.loads(override_labels_json) if override_labels_json else LABELS
    ranked = sorted(zip(labels, probs[:len(labels)]), key=lambda z:z[1], reverse=True)

    # Cải thiện logic chọn nhãn cho ảnh people
    people_score = 0
    for n, s in ranked:
        if n == "People & Events":
            people_score = s
            break
    
    # Phát hiện con người bằng computer vision
    has_people_detected = detect_people_in_image(pil)
    
    # Logic ưu tiên People & Events:
    # 1. Nếu People & Events có score > 0.25 (giảm từ 0.3)
    # 2. HOẶC nếu phát hiện có người và People & Events có score > 0.15
    if people_score > 0.25 or (has_people_detected and people_score > 0.15):
        top_active = ["People & Events"]
    else:
        # Chọn các nhãn vượt ngưỡng như bình thường
        top_active = [n for n,s in ranked if s >= THRESH][:3]
    
    # Bước 3: Tạo caption bằng BLIP AI (để làm context cho title generation)
    # print(f"📝 [Image {image_id}] Đang tạo caption bằng AI...")  # Bỏ log chi tiết
    caption_en, blip_caption = generate_caption_with_blip2(pil)
    
    # Nếu BLIP thất bại, fallback về template
    if blip_caption is None:
        print(f"⚠️  [Image {image_id}] Fallback về template caption...")
        confidence_scores = [s for n,s in ranked]
        blip_caption = generate_caption_vi(pil, top_active or [ranked[0][0]], confidence_scores)
        caption_en = None  # Không có caption tiếng Anh
    
    # Bước 4: Tạo tiêu đề tiếng Việt (luôn luôn chạy)
    caption_vi = None  # Caption tiếng Việt sẽ là title được generate
    
    if generate_title and blip_caption:
        try:
            # print(f"✍️  [Image {image_id}] Đang tạo tiêu đề sáng tạo...")  # Bỏ log chi tiết
            # Lấy category chính (category đầu tiên)
            main_category = top_active[0] if top_active else None
            
            # Generate titles (chỉ lấy 1 title đầu tiên)
            titles_result = generate_titles(
                caption_vi=blip_caption,
                category=main_category,
                place=None,  # Auto-detect from caption
                num_titles=1  # Chỉ cần 1 title
            )
            
            if titles_result['success'] and titles_result['titles']:
                # Lấy title đầu tiên làm caption_vi
                caption_vi = titles_result['titles'][0]
                # Xóa dấu ngoặc kép nếu có
                caption_vi = caption_vi.strip('"\'')
                # print(f"✅ [Image {image_id}] Đã tạo caption: {caption_vi}")  # Bỏ log chi tiết
            else:
                print(f"⚠️  [Image {image_id}] Title generation failed, using BLIP caption")
                caption_vi = blip_caption
        
        except Exception as e:
            print(f"⚠️  [Image {image_id}] Lỗi khi tạo tiêu đề: {e}")
            caption_vi = blip_caption
    else:
        # Nếu không generate title, dùng BLIP caption
        caption_vi = blip_caption

    # Build response
    response = {
        "imageId": image_id,
        "nsfw_check": {
            "predicted_label": nsfw_result['predicted_label'],
            "is_violation": nsfw_result['is_violation'],
            "level": nsfw_result['level'],
            "message": nsfw_result['message']
        },
        "activeLabels": top_active,
        "caption_en": caption_en,  # BLIP caption tiếng Anh gốc (đơn giản)
        "caption_vi": caption_vi   # Title AI-generated (dài, chi tiết)
    }
    
    return response

@app.post("/generate-title")
async def generate_title_only(
    caption_vi: str = Form(...),
    category: Optional[str] = Form(None),
    place: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """
    Generate titles from existing caption (no image analysis)
    
    Faster endpoint when you already have caption and just need titles.
    """
    try:
        result = generate_titles(
            caption_vi=caption_vi,
            category=category,
            place=place
        )
        return result
    except Exception as e:
        return {
            "titles": [],
            "place": place,
            "category": category,
            "success": False,
            "error": str(e)
        }

# (tuỳ chọn) endpoint nhận feedback song song
@app.post("/feedback")
async def feedback(payload: Dict[str, Any]):
    # Bạn có thể ghi file log JSON hoặc push DB ở đây; demo: trả lại payload
    return {"ok": True, "received": payload}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "AI Title Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
