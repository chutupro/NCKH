#!/usr/bin/env python3
"""
Download LLM Model for Title Generation

Tự động tải Qwen2-1.5B-Instruct GGUF model từ Hugging Face Hub
Dùng khi clone repo mà chưa có model trong models/llm/

Usage:
    python download_llm.py
"""

from pathlib import Path
from huggingface_hub import hf_hub_download
import sys

def download_llm_model():
    """
    Download Qwen2-1.5B-Instruct GGUF model
    """
    model_dir = Path(__file__).parent / "models" / "llm"
    model_path = model_dir / "qwen2-1_5b-instruct-q4_k_m.gguf"
    
    # Check if already exists
    if model_path.exists():
        print(f"✅ Model đã tồn tại: {model_path}")
        print(f"   Size: {model_path.stat().st_size / (1024**3):.2f} GB")
        return True
    
    # Create directory
    model_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("📥 Đang tải LLM Model cho Title Generation...")
    print("=" * 60)
    print(f"Model: Qwen/Qwen2-1.5B-Instruct-GGUF")
    print(f"File: qwen2-1_5b-instruct-q4_k_m.gguf (~1GB)")
    print(f"Đích: {model_path}")
    print("")
    
    try:
        # Download from HuggingFace Hub
        downloaded_path = hf_hub_download(
            repo_id="Qwen/Qwen2-1.5B-Instruct-GGUF",
            filename="qwen2-1_5b-instruct-q4_k_m.gguf",
            local_dir=model_dir,
            local_dir_use_symlinks=False
        )
        
        print("")
        print("=" * 60)
        print("✅ Tải model thành công!")
        print("=" * 60)
        print(f"Đã lưu tại: {model_path}")
        print(f"Size: {model_path.stat().st_size / (1024**3):.2f} GB")
        print("")
        print("🚀 Bạn có thể chạy service ngay:")
        print("   cd ai")
        print("   python app.py")
        
        return True
        
    except Exception as e:
        print("")
        print("=" * 60)
        print("❌ LỖI khi tải model!")
        print("=" * 60)
        print(f"Chi tiết: {e}")
        print("")
        print("🔧 Cách khắc phục:")
        print("1. Kiểm tra kết nối internet")
        print("2. Cài đặt huggingface_hub:")
        print("   pip install huggingface_hub")
        print("3. Hoặc tải thủ công từ:")
        print("   https://huggingface.co/Qwen/Qwen2-1.5B-Instruct-GGUF")
        print(f"   Lưu vào: {model_path}")
        
        return False

if __name__ == "__main__":
    print("")
    success = download_llm_model()
    print("")
    
    if not success:
        sys.exit(1)

