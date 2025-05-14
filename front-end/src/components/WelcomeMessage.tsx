import React from 'react';

const WelcomeMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-leaf flex items-center justify-center mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white"
        >
          <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4-.83.83-2 1.5-3 1.5C2 15.5.5 14 .5 12S2 8.5 4 8.5c0-1.5.5-3 2-4 1.5-1 3-1.5 4.5-1 0 0 .5 1 .5 2 0 2-1 4.5-1 6.5 0 1.25.5 2 1 2.5"/>
          <path d="M10 19c-.65-1.95-1-3.25-1-5.5m0 0c0-2.5 1-5 2-7 0 0 1.03 1 2 2 1.5 1.5 3 4 3 6s-1 4-3 6"/>
          <path d="M18 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4-.83.83-2 1.5-3 1.5-2 0-3.5-1.5-3.5-3.5S17 8.5 19 8.5c0-1.5.5-3 2-4 1.5-1 3-1.5 4.5-1 0 0 .5 1 .5 2 0 2-1 4.5-1 6.5 0 1.25.5 2 1 2.5"/>
        </svg>
      </div>
      
      <h1 className="text-2xl font-semibold mb-2">Welcome to Leaf Whisper</h1>
      
      <p className="text-muted-foreground mb-6">
        Giúp chuẩn đoán bệnh lá cây thông qua mô tả hoặc hình ảnh
      </p>
      
      <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left w-full">
        <h2 className="text-lg font-medium mb-2">Cách sử dụng:</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-leaf-dark/30 flex items-center justify-center flex-shrink-0">1</div>
            <span>Mô tả triệu chứng bệnh lá cây</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-leaf-dark/30 flex items-center justify-center flex-shrink-0">2</div>
            <span>Hoặc tải lên hình ảnh lá cây bị bệnh</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-leaf-dark/30 flex items-center justify-center flex-shrink-0">3</div>
            <span>Nhận kết quả chẩn đoán từ hệ thống</span>
          </li>
        </ul>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Bắt đầu bằng cách nhập mô tả hoặc tải ảnh lên ngay bên dưới
      </p>
    </div>
  );
};

export default WelcomeMessage;
