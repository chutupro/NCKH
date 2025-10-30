"""
Title Generator for Instagram-style captions

Uses Qwen2-1.5B-Instruct LLM to generate creative, artistic Vietnamese titles
for images based on:
- AI-generated caption (Vietnamese)
- Image classification (Heritage/Culture/Nature/People)
- Place detection (Đà Nẵng/Hội An landmarks)

Performance: ~500ms-1.5s on GPU (RTX 3050)
VRAM usage: ~1.5-2GB
"""

from typing import List, Optional, Dict
import re
import sys
import os
from pathlib import Path

# Lazy load LLM to save memory
_LLM_MODEL = None
_LLM_ENABLED = False

# Đà Nẵng / Hội An place detection dictionary
DA_NANG_PLACES = {
    # Đà Nẵng landmarks
    "đà nẵng": "Đà Nẵng",
    "da nang": "Đà Nẵng",
    "sông hàn": "Sông Hàn",
    "song han": "Sông Hàn",
    "cầu rồng": "Cầu Rồng",
    "cau rong": "Cầu Rồng",
    "dragon bridge": "Cầu Rồng",
    "sơn trà": "Bán đảo Sơn Trà",
    "son tra": "Bán đảo Sơn Trà",
    "linh ứng": "Chùa Linh Ứng",
    "linh ung": "Chùa Linh Ứng",
    "lady buddha": "Chùa Linh Ứng",
    "ngũ hành sơn": "Ngũ Hành Sơn",
    "ngu hanh son": "Ngũ Hành Sơn",
    "marble mountains": "Ngũ Hành Sơn",
    "mỹ khê": "Biển Mỹ Khê",
    "my khe": "Biển Mỹ Khê",
    "non nước": "Bãi biển Non Nước",
    "non nuoc": "Bãi biển Non Nước",
    "bãi rạng": "Bãi biển Bãi Rạng",
    "bai rang": "Bãi biển Bãi Rạng",
    
    # Hội An landmarks
    "hội an": "Hội An",
    "hoi an": "Hội An",
    "phố cổ": "Phố cổ Hội An",
    "pho co": "Phố cổ Hội An",
    "old town": "Phố cổ Hội An",
    "chùa cầu": "Chùa Cầu",
    "chua cau": "Chùa Cầu",
    "japanese bridge": "Chùa Cầu",
    "cầu nhật bản": "Chùa Cầu",
    "rừng dừa": "Rừng dừa Bảy Mẫu",
    "rung dua": "Rừng dừa Bảy Mẫu",
    "coconut forest": "Rừng dừa Bảy Mẫu",
    "bảy mẫu": "Rừng dừa Bảy Mẫu",
    "bay mau": "Rừng dừa Bảy Mẫu",
    "đèn lồng": "Hội An (đèn lồng)",
    "den long": "Hội An (đèn lồng)",
    "lantern": "Hội An (đèn lồng)",
    "phố hội": "Phố Hội",
    "pho hoi": "Phố Hội",
    "sông thu bồn": "Sông Thu Bồn",
    "song thu bon": "Sông Thu Bồn",
    "thu bon river": "Sông Thu Bồn"
}

# Category to Vietnamese mapping
CATEGORY_VI = {
    "Heritage & Architecture": "Di sản & Kiến trúc",
    "Culture & Art": "Văn hoá & Nghệ thuật", 
    "Nature & Landscape": "Thiên nhiên & Cảnh quan",
    "People & Events": "Con người & Sự kiện"
}

# Vibe/mood suggestions based on category
CATEGORY_VIBE = {
    "Heritage & Architecture": "hoài cổ, trang nghiêm, lịch sử",
    "Culture & Art": "sôi động, đậm chất nghệ thuật, đặc sắc",
    "Nature & Landscape": "thơ mộng, yên bình, hùng vĩ",
    "People & Events": "ấm áp, gần gũi, đầy cảm xúc"
}

# Place-specific vibes (override category vibe if place detected)
PLACE_VIBE = {
    "Đà Nẵng": "hiện đại, năng động, biển xanh",
    "Sông Hàn": "lãng mạn, chiều mềm, ánh đèn lung linh",
    "Cầu Rồng": "huyền thoại, rực rỡ, biểu tượng thành phố",
    "Bán đảo Sơn Trà": "hoang sơ, hùng vĩ, thiên nhiên bạt ngàn",
    "Chùa Linh Ứng": "linh thiêng, tĩnh lặng, bình yên",
    "Ngũ Hành Sơn": "huyền bí, linh thiêng, núi đá cổ kính",
    "Biển Mỹ Khê": "sóng vỗ, cát trắng, nắng vàng",
    "Hội An": "hoài niệm, đèn vàng, phố xưa",
    "Phố cổ Hội An": "cổ kính, hoài niệm, đèn lồng rực rỡ",
    "Chùa Cầu": "cổ kính, biểu tượng văn hoá, nét xưa",
    "Rừng dừa Bảy Mẫu": "xanh mát, thanh bình, dừa nghiêng"
}


def detect_place(caption_vi: str) -> Optional[str]:
    """
    Detect Đà Nẵng/Hội An places from Vietnamese caption
    
    Args:
        caption_vi: Vietnamese caption text
        
    Returns:
        Place name if detected, None otherwise
    """
    if not caption_vi:
        return None
    
    text_lower = caption_vi.lower()
    
    # Check for place keywords
    for keyword, place_name in DA_NANG_PLACES.items():
        if keyword in text_lower:
            return place_name
    
    return None


def get_vibe(category: Optional[str] = None, place: Optional[str] = None) -> str:
    """
    Get mood/vibe description for title generation
    
    Priority: place-specific vibe > category vibe > default
    
    Args:
        category: Image category (Heritage/Culture/Nature/People)
        place: Detected place name
        
    Returns:
        Vibe description string
    """
    # Priority 1: Place-specific vibe
    if place:
        for place_key, vibe in PLACE_VIBE.items():
            if place_key in place:
                return vibe
    
    # Priority 2: Category vibe
    if category and category in CATEGORY_VIBE:
        return CATEGORY_VIBE[category]
    
    # Default
    return "đẹp, ấn tượng, đáng nhớ"


def get_llm():
    """
    Lazy load LLM model to save memory
    
    Returns:
        Llama model instance or None if loading fails
    """
    global _LLM_MODEL, _LLM_ENABLED
    
    if _LLM_MODEL is not None:
        return _LLM_MODEL
    
    if _LLM_ENABLED:  # Already tried and succeeded
        return _LLM_MODEL
    
    try:
        from llama_cpp import Llama
        import os
        
        # Try multiple possible paths (depends on where script is run from)
        possible_paths = [
            Path("models/llm/qwen2-1_5b-instruct-q4_k_m.gguf"),  # From root
            Path("../models/llm/qwen2-1_5b-instruct-q4_k_m.gguf"),  # From ai/
        ]
        
        model_path = None
        for p in possible_paths:
            if p.exists():
                model_path = p
                break
        
        if model_path is None:
            print(f"⚠️  LLM model not found in any of these locations:")
            for p in possible_paths:
                print(f"     - {p.absolute()}")
            print("   Run 'python download_llm.py' to download the model")
            return None
        
        # print(f"🔄 Loading LLM from: {model_path}...")  # Bỏ log chi tiết
        
        # Suppress llama.cpp stderr warnings
        stderr_backup = sys.stderr
        sys.stderr = open(os.devnull, 'w')
        
        try:
            _LLM_MODEL = Llama(
                model_path=str(model_path),
                n_gpu_layers=-1,  # Full GPU offload (RTX 3050)
                n_ctx=2048,       # Context window
                n_batch=512,      # Batch size for prompt processing
                n_threads=4,      # CPU threads for non-GPU ops
                verbose=False,
                seed=42           # Reproducible results
            )
        finally:
            # Restore stderr
            sys.stderr.close()
            sys.stderr = stderr_backup
        
        _LLM_ENABLED = True
        print("✅ LLM đã tải xong (chỉ lần đầu)")
        return _LLM_MODEL
        
    except ImportError as e:
        print(f"⚠️  llama-cpp-python not installed: {e}")
        print("   Install with: pip install llama-cpp-python")
        print("   Or with CUDA: pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121")
        return None
        
    except Exception as e:
        print(f"⚠️  Error loading LLM: {e}")
        return None


def build_prompt(
    caption_vi: str,
    category: Optional[str] = None,
    place: Optional[str] = None
) -> str:
    """
    Build LLM prompt for title generation
    
    Args:
        caption_vi: Vietnamese caption/description
        category: Image category (Heritage/Culture/Nature/People)
        place: Detected place name
        
    Returns:
        Formatted prompt string
    """
    # Get category in Vietnamese
    category_vi = CATEGORY_VI.get(category, category) if category else "Không xác định"
    
    # Get vibe/mood
    vibe = get_vibe(category, place)
    
    # Place info
    place_info = f"Địa điểm: {place}" if place else "Địa điểm: Không xác định"
    
    # System prompt
    system = (
        "Bạn là người viết caption Instagram cho du lịch Việt Nam. "
        "Tạo caption đơn giản, dễ hiểu, gần gũi như người bình thường chia sẻ. "
        "Dùng tiếng Việt đời thường, tự nhiên, KHÔNG dùng từ cổ, từ văn chương phức tạp. "
        "Độ dài 8-15 từ, KHÔNG dùng emoji, KHÔNG giáo huấn."
    )
    
    # User prompt
    user = f"""Thông tin ảnh:
- Mô tả: {caption_vi}
- Danh mục: {category_vi}
- {place_info}
- Cảm xúc: {vibe}

Yêu cầu:
1. Tạo ĐÚNG 3 tiêu đề khác nhau
2. Mỗi tiêu đề trên 1 dòng
3. Độ dài: 8-15 từ
4. Từ ngữ: Đơn giản, dễ hiểu, đời thường (KHÔNG dùng từ cổ, từ văn chương)
5. Phong cách: Tự nhiên, gần gũi như người bình thường viết Instagram
6. KHÔNG dùng emoji
7. KHÔNG đánh số thứ tự
8. Câu văn súc tích, rõ nghĩa

Ví dụ TỐT:
- "Sáng sớm ở phố cổ Hội An đẹp quá"
- "Cầu Rồng lung linh ánh đèn khi về đêm"
- "Thiên nhiên Sơn Trà xanh mướt bất ngờ"

Ví dụ XẤU (quá văn chương, tránh):
- "Hồng Hoàng Mộng Vọng: Một Trang Sử Hoài Hợi"
- "Kinh Đô Ánh Vàng Trong Mơ Mộng"
- "Thiên Đường Xanh Ngát Tuyệt Vời"

Xuất 3 tiêu đề:"""
    
    # Qwen2 chat format
    prompt = f"<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n"
    
    return prompt


def parse_titles(llm_output: str) -> List[str]:
    """
    Parse LLM output to extract 3 titles
    
    Args:
        llm_output: Raw LLM output text
        
    Returns:
        List of 3 titles (or fewer if parsing fails)
    """
    # Split by newlines
    lines = llm_output.strip().split('\n')
    
    titles = []
    for line in lines:
        # Clean up
        line = line.strip()
        
        # Remove common prefixes
        line = re.sub(r'^[-*•]\s*', '', line)  # Remove bullet points
        line = re.sub(r'^\d+[.)]\s*', '', line)  # Remove numbering
        line = re.sub(r'^Title\s*\d*:\s*', '', line, flags=re.IGNORECASE)  # Remove "Title:"
        
        # Skip empty or too short
        if not line or len(line.split()) < 3:
            continue
        
        # Skip lines with emojis (shouldn't happen but just in case)
        if any(ord(c) > 127 and ord(c) in range(0x1F300, 0x1F9FF) for c in line):
            continue
        
        # Add to titles
        titles.append(line)
        
        # Stop at 3
        if len(titles) >= 3:
            break
    
    # Fallback if parsing failed
    if not titles:
        titles = [llm_output.strip()]
    
    return titles[:3]


def generate_titles(
    caption_vi: str,
    category: Optional[str] = None,
    place: Optional[str] = None,
    max_tokens: int = 180,
    temperature: float = 0.85,
    top_p: float = 0.9,
    num_titles: int = 3
) -> Dict[str, any]:
    """
    Generate Instagram-style titles for an image
    
    Args:
        caption_vi: Vietnamese caption/description
        category: Image category (Heritage/Culture/Nature/People)
        place: Detected place name (optional, will auto-detect from caption)
        max_tokens: Max tokens for LLM generation (increased for longer titles)
        temperature: Sampling temperature (higher = more creative)
        top_p: Nucleus sampling parameter
        num_titles: Number of titles to generate (default 3, can be 1 for API)
        
    Returns:
        Dict with:
            - titles: List[str] - Generated titles (length = num_titles)
            - place: str - Detected place
            - category: str - Category used
            - success: bool - Whether generation succeeded
            - error: Optional[str] - Error message if failed
    """
    # Auto-detect place if not provided
    if place is None:
        place = detect_place(caption_vi)
    
    # Try to load LLM
    llm = get_llm()
    
    if llm is None:
        # Fallback: generate simple titles without LLM
        print("⚠️  LLM not available, using fallback titles")
        category_vi = CATEGORY_VI.get(category, "Khoảnh khắc")
        fallback_titles = [
            f"{category_vi} đáng nhớ",
            caption_vi[:50] if len(caption_vi) <= 50 else caption_vi[:47] + "...",
            f"{place}" if place else "Khung cảnh tuyệt vời"
        ]
        return {
            "titles": fallback_titles,
            "place": place,
            "category": category,
            "success": False,
            "error": "LLM not available"
        }
    
    try:
        # Build prompt
        prompt = build_prompt(caption_vi, category, place)
        
        # Generate
        output = llm(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop=["<|im_end|>", "\n\n\n"],  # Stop tokens
            echo=False
        )
        
        # Extract text
        generated_text = output["choices"][0]["text"]
        
        # Parse titles
        titles = parse_titles(generated_text)
        
        # Lấy đúng số lượng titles cần thiết
        titles = titles[:num_titles] if titles else []
        
        return {
            "titles": titles,
            "place": place,
            "category": category,
            "success": True,
            "error": None
        }
        
    except Exception as e:
        print(f"⚠️  Error generating titles: {e}")
        
        # Fallback
        category_vi = CATEGORY_VI.get(category, "Khoảnh khắc")
        fallback_titles = [
            f"{category_vi} đẹp",
            caption_vi[:50] if len(caption_vi) <= 50 else caption_vi[:47] + "...",
            f"{place}" if place else "Ảnh tuyệt vời"
        ]
        
        return {
            "titles": fallback_titles,
            "place": place,
            "category": category,
            "success": False,
            "error": str(e)
        }


# Test function
if __name__ == "__main__":
    print("Testing Title Generator...")
    print()
    
    # Test 1: Heritage
    print("Test 1: Heritage & Architecture")
    result = generate_titles(
        caption_vi="Một ngôi đền cổ kính với kiến trúc truyền thống",
        category="Heritage & Architecture"
    )
    print(f"  Place: {result['place']}")
    print(f"  Titles:")
    for i, title in enumerate(result['titles'], 1):
        print(f"    {i}. {title}")
    print()
    
    # Test 2: Đà Nẵng
    print("Test 2: Đà Nẵng landmark")
    result = generate_titles(
        caption_vi="Cầu Rồng lung linh ánh đèn về đêm",
        category="Heritage & Architecture"
    )
    print(f"  Place: {result['place']}")
    print(f"  Titles:")
    for i, title in enumerate(result['titles'], 1):
        print(f"    {i}. {title}")
    print()
    
    # Test 3: Hội An
    print("Test 3: Hội An")
    result = generate_titles(
        caption_vi="Phố cổ Hội An với những chiếc đèn lồng đầy màu sắc",
        category="Culture & Art"
    )
    print(f"  Place: {result['place']}")
    print(f"  Titles:")
    for i, title in enumerate(result['titles'], 1):
        print(f"    {i}. {title}")
    print()

