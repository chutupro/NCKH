// src/pages/ContributeInformation.jsx
import React, { useState, useEffect } from 'react';
import Headers from '../Component/home/Headers';
import Footer from '../Component/home/Footer';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import '../Styles/Contribute/contributeInformation.css';
import AIGeneratedFields from '../Component/contribute/AIGeneratedFields';
import UserInputFields from '../Component/contribute/UserInputFields';
import ContributeGuidelines from '../Component/contribute/ContributeGuidelines';

export default function ContributeInformation() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiCategory, setAiCategory] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [formData, setFormData] = useState({ author: '', description: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsAnalyzing(true);
    const image = localStorage.getItem('selectedImage');
    const category = localStorage.getItem('aiCategory');
    const title = localStorage.getItem('aiTitle');
    if (image) setSelectedImage(image);
    if (category) setAiCategory(category);
    if (title) setAiTitle(title);
    setIsAnalyzing(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      localStorage.removeItem('selectedImage');
      localStorage.removeItem('aiCategory');
      localStorage.removeItem('aiTitle');
      window.location.href = '/contribute';
    }, 3000);
  };

  const handleBackToUpload = () => {
    window.location.href = '/contribute';
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1612 0%, #2a2520 50%, #1a1612 100%)', color: '#D4C5A9', minHeight: '100vh' }}>
      <Headers />
      <main className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div style={{ backgroundColor: 'rgba(212, 197, 169, 0.15)' }} className="p-4 rounded-full">
                <Send style={{ color: '#D4C5A9' }} className="size-12" />
              </div>
            </div>
            <h2 style={{ color: '#E8DCC4' }}>Hoàn tất thông tin đóng góp</h2>
            <p className="opacity-90" style={{ color: '#D4C5A9' }}>AI đã phân tích và gợi ý danh mục, tiêu đề cho ảnh của bạn. Vui lòng bổ sung thông tin để hoàn tất đóng góp.</p>
          </div>
          {submitted && (
            <div style={{ backgroundColor: 'rgba(212, 197, 169, 0.15)', border: '1px solid #C4B998' }} className="mb-8 p-6 rounded-lg flex items-center gap-4">
              <CheckCircle style={{ color: '#C4B998' }} className="size-6" />
              <div>
                <h3 style={{ color: '#E8DCC4' }}>Gửi thành công!</h3>
                <p style={{ color: '#D4C5A9' }} className="opacity-80">Cảm ơn bạn đã đóng góp. Đóng góp của bạn sẽ được xem xét và phê duyệt sớm.</p>
              </div>
            </div>
          )}
          <div style={{ backgroundColor: 'rgba(26, 22, 18, 0.8)', border: '1px solid rgba(212, 197, 169, 0.3)' }} className="rounded-lg shadow-2xl">
            <div className="p-6">
              <h3 style={{ color: '#E8DCC4' }}>Thông tin đóng góp</h3>
              <p style={{ color: '#D4C5A9', opacity: 0.8 }}>Các trường có dấu * là bắt buộc</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label style={{ color: '#E8DCC4' }}>Hình ảnh đã tải lên</label>
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(212,197,169,0.3)' }}>
                  <img src={selectedImage || ''} alt="Uploaded" className="w-full h-64 object-cover" />
                </div>
              </div>
              <AIGeneratedFields aiCategory={aiCategory} setAiCategory={setAiCategory} aiTitle={aiTitle} setAiTitle={setAiTitle} />
              <UserInputFields formData={formData} setFormData={setFormData} />
              <ContributeGuidelines />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleBackToUpload} style={{ color: '#D4C5A9', borderColor: 'rgba(212,197,169,0.3)' }} className="border hover:bg-[rgba(212,197,169,0.1)]">
                  <ArrowLeft className="mr-2 size-4" />Quay lại
                </button>
                <button type="submit" disabled={submitted} style={{ backgroundColor: '#C4B998', color: '#1a1612' }} className="flex-1 hover:bg-opacity-90 shadow-lg">
                  <Send className="mr-2 size-4" />{submitted ? 'Đã gửi' : 'Gửi đóng góp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}