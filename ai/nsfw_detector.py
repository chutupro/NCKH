#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NSFW Image Detector
Sử dụng mô hình LukeJacob2023/nsfw-image-detector từ Hugging Face
để phát hiện ảnh vi phạm tiêu chuẩn cộng đồng
"""

import torch
from transformers import ViTFeatureExtractor, ViTForImageClassification
from PIL import Image
import requests
import os
import warnings
from typing import Dict

# Suppress transformers warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

class NSFWDetector:
    def __init__(self, model_name: str = "LukeJacob2023/nsfw-image-detector"):
        """
        Khởi tạo NSFW Detector
        
        Args:
            model_name: Tên mô hình từ Hugging Face
        """
        self.model_name = model_name
        self.labels = ['drawings', 'hentai', 'neutral', 'porn', 'sexy']
        self.nsfw_labels = ['hentai', 'porn', 'sexy']  # Các nhãn được coi là NSFW
        
        # Load model (suppress logs)
        self.feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)
        self.model = ViTForImageClassification.from_pretrained(model_name)
    
    def predict_single_image(self, image: Image.Image) -> Dict:
        """
        Dự đoán một ảnh
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary chứa kết quả dự đoán với 3 mức độ vi phạm
        """
        # Tiền xử lý ảnh
        inputs = self.feature_extractor(images=image, return_tensors="pt")
        
        # Dự đoán
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
        
        # Lấy kết quả
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = self.labels[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item()
        
        # Xác định mức độ vi phạm (3 cấp)
        if predicted_label == "neutral":
            level = "safe"
            is_violation = False
            message = "Ảnh an toàn"
        elif predicted_label == "sexy":
            level = "mild"
            is_violation = True
            message = "Ảnh có yếu tố gợi cảm"
        elif predicted_label in ["porn", "hentai"]:
            level = "severe"
            is_violation = True
            message = "Ảnh có nội dung không phù hợp"
        else:  # drawings
            level = "safe"
            is_violation = False
            message = "Ảnh an toàn"
        
        # Lấy xác suất cho tất cả các lớp
        all_probabilities = {}
        for i, label in enumerate(self.labels):
            all_probabilities[label] = probabilities[0][i].item()
        
        return {
            'predicted_label': predicted_label,
            'confidence': confidence,
            'is_violation': is_violation,
            'level': level,
            'message': message,
            'all_probabilities': all_probabilities,
            'nsfw_probability': sum(all_probabilities[label] for label in self.nsfw_labels)
        }

