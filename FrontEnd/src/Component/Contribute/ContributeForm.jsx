import React, { useState, useRef } from 'react';
import { Upload, Loader2, Sparkles, CheckCircle, X } from 'lucide-react';

export default function ContributeForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const mockCategories = ['Kiến trúc tôn giáo', 'Kiến trúc hiện đại', 'Nghề truyền thống', 'Lịch sử', 'Văn hóa', 'Ẩm thực'];
      const mockTitles = ['Chùa Linh Ứng - Bán đảo Sơn Trà', 'Cầu Rồng - Biểu tượng Đà Nẵng', 'Làng nghề mộc Kim Bồng', 'Bảo tàng điêu khắc Chăm', 'Lễ hội truyền thống làng biển', 'Mì Quảng truyền thống'];
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
      localStorage.setItem('selectedImage', selectedImage);
      localStorage.setItem('aiCategory', randomCategory);
      localStorage.setItem('aiTitle', randomTitle);
      setIsAnalyzing(false);
      window.location.href = '/contribute-information';
    }, 2000);
  };

  return (
    <div className="upload-card" style={{ backgroundColor: 'rgba(26, 22, 18, 0.8)', border: '1px solid rgba(212, 197, 169, 0.3)' }}>
      <div className="text-center mb-12">
        <div className="mb-6 flex justify-center">
          <div style={{ backgroundColor: 'rgba(212, 197, 169, 0.15)' }} className="p-4 rounded-full">
            <Sparkles style={{ color: '#D4C5A9' }} className="size-12" />
          </div>
        </div>
        <h2 style={{ color: '#E8DCC4' }}>Đóng góp ảnh di sản văn hóa</h2>
        <p className="opacity-90" style={{ color: '#D4C5A9' }}>Tải lên hình ảnh di sản văn hóa Đà Nẵng và để AI của chúng tôi tự động phân tích, nhận diện danh mục và gợi ý tiêu đề phù hợp.</p>
      </div>
      <div>
        <h3 style={{ color: '#E8DCC4' }}>Tải lên hình ảnh</h3>
        <p style={{ color: '#D4C5A9', opacity: 0.8 }}>Chọn hoặc kéo thả hình ảnh vào đây để bắt đầu</p>
      </div>
      <div 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop} 
        onClick={() => fileInputRef.current?.click()} 
        className={`rounded-lg p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-[#C4B998] bg-[rgba(212,197,169,0.15)]' : 'border-[#D4C5A9]/30'}`} 
        style={{ borderWidth: 2, borderStyle: 'dashed' }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {!selectedImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div style={{ backgroundColor: 'rgba(212, 197, 169, 0.15)' }} className="p-4 rounded-full">
                <Upload style={{ color: '#D4C5A9' }} className="size-10" />
              </div>
            </div>
            <div>
              <p style={{ color: '#E8DCC4' }}><span className="font-medium">Nhấn để chọn ảnh</span> hoặc kéo thả vào đây</p>
              <p className="text-sm opacity-70" style={{ color: '#D4C5A9' }}>Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={selectedImage} alt="Preview" className="max-h-96 mx-auto rounded-lg shadow-lg object-contain" />
              <div className="absolute top-2 right-2">
                <button onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }} style={{ color: '#D4C5A9' }} className="p-2 rounded-full bg-black/70 hover:bg-black/90 transition-colors">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#C4B998' }}>
              <CheckCircle className="size-5" />
              <span>Ảnh đã được tải lên thành công</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ backgroundColor: 'rgba(212, 197, 169, 0.1)', border: '1px solid rgba(212, 197, 169, 0.2)' }} className="p-4 rounded-lg space-y-2">
        <h4 style={{ color: '#E8DCC4' }}>Lưu ý khi chọn ảnh:</h4>
        <ul className="text-sm space-y-1 opacity-85" style={{ color: '#D4C5A9' }}>
          <li>• Chọn ảnh có chất lượng tốt, rõ nét</li>
          <li>• Ảnh nên thể hiện rõ di sản văn hóa cần đóng góp</li>
          <li>• Tránh ảnh bị mờ, quá tối hoặc quá sáng</li>
          <li>• AI sẽ phân tích tốt hơn với ảnh có góc chụp đẹp</li>
        </ul>
      </div>
      {selectedImage && (
        <button onClick={handleAnalyzeImage} disabled={isAnalyzing} style={{ backgroundColor: '#C4B998', color: '#1a1612' }} className="w-full hover:bg-opacity-90 shadow-lg mt-4">
          {isAnalyzing ? (<><Loader2 className="mr-2 size-5 animate-spin" />Đang phân tích...</>) : (<><Sparkles className="mr-2 size-5" />Phân tích ảnh với AI</>)}
        </button>
      )}
    </div>
  );
}