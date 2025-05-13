import React, { useState } from 'react';
import { DiseaseInfo, WeatherInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info, Thermometer, Wrench, Clipboard } from 'lucide-react';

interface DiseaseDetailsProps {
  diseaseInfo: DiseaseInfo;
  weatherInfo?: WeatherInfo;
  onRequestLocation: () => void;
}

const DiseaseDetails = ({ diseaseInfo, weatherInfo, onRequestLocation }: DiseaseDetailsProps) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="mt-4 space-y-4">
      {!weatherInfo && (
        <div className="bg-secondary/30 rounded-lg p-4 text-sm">
          <p className="mb-2 font-medium">Để nhận thông tin điều trị chính xác hơn, vui lòng cung cấp vị trí của bạn</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRequestLocation}
            className="w-full mt-2"
          >
            <Thermometer className="mr-2 h-4 w-4" />
            Cung cấp vị trí
          </Button>
        </div>
      )}

      {weatherInfo && (
        <div className="bg-secondary/30 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Thời tiết tại {weatherInfo.location}</h3>
            <div className="flex items-center text-primary">
              <Thermometer className="h-4 w-4 mr-1" />
              <span className="text-sm">{weatherInfo.temperature}°C</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{weatherInfo.conditions}, Độ ẩm: {weatherInfo.humidity}%</p>
          <p className={`text-sm mt-2 ${weatherInfo.suitable_for_treatment ? 'text-primary' : 'text-destructive'}`}>
            {weatherInfo.recommendation}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Collapsible open={openSection === 'details'} className="border border-border/50 rounded-lg overflow-hidden">
          <CollapsibleTrigger
            onClick={() => toggleSection('details')}
            className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50"
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Chi tiết về bệnh</span>
            </div>
            <div className="w-4 h-4 text-primary">
              {openSection === 'details' ? '−' : '+'}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 bg-secondary/10">
            <p className="text-sm">{diseaseInfo.details}</p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={openSection === 'treatment'} className="border border-border/50 rounded-lg overflow-hidden">
          <CollapsibleTrigger
            onClick={() => toggleSection('treatment')}
            className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50"
          >
            <div className="flex items-center">
              <Wrench className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Cách điều trị</span>
            </div>
            <div className="w-4 h-4 text-primary">
              {openSection === 'treatment' ? '−' : '+'}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 bg-secondary/10">
            <p className="text-sm">{diseaseInfo.treatment}</p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={openSection === 'medications'} className="border border-border/50 rounded-lg overflow-hidden">
          <CollapsibleTrigger
            onClick={() => toggleSection('medications')}
            className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50"
          >
            <div className="flex items-center">
              <Clipboard className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Thuốc khuyến nghị</span>
            </div>
            <div className="w-4 h-4 text-primary">
              {openSection === 'medications' ? '−' : '+'}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 bg-secondary/10">
            <ul className="list-disc pl-5 text-sm space-y-1">
              {diseaseInfo.medications.map((med, index) => (
                <li key={index}>{med}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default DiseaseDetails;
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Thermometer, Send } from 'lucide-react';
//
// interface DiseaseDetailsProps {
//   diseaseInfo: any;
//   weatherInfo?: any;
//   onRequestLocation: (location: string) => void;
// }
//
// const DiseaseDetails = ({ diseaseInfo, weatherInfo, onRequestLocation }: DiseaseDetailsProps) => {
//   const [showLocationInput, setShowLocationInput] = useState(false);
//   const [location, setLocation] = useState('');
//
//   const handleRequestLocation = () => {
//     setShowLocationInput(true);
//   };
//
//   const handleSubmitLocation = () => {
//     if (location.trim()) {
//       onRequestLocation(location);
//       setLocation('');
//       setShowLocationInput(false);
//     }
//   };
//
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleSubmitLocation();
//     }
//   };
//
//   return (
//     <div className="mt-4 space-y-4">
//       {!weatherInfo && (
//         <div className="bg-secondary/30 rounded-lg p-4 text-sm">
//           <p className="mb-2 font-medium">Để nhận thông tin điều trị chính xác hơn, vui lòng cung cấp vị trí của bạn</p>
//
//           {!showLocationInput ? (
//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={handleRequestLocation}
//               className="w-full mt-2"
//             >
//               <Thermometer className="mr-2 h-4 w-4" />
//               Cung cấp vị trí
//             </Button>
//           ) : (
//             <div className="mt-2 space-y-2">
//               <p className="text-xs text-muted-foreground">Nhập tên tỉnh/thành phố của bạn:</p>
//               <div className="flex gap-2">
//                 <Input
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
//                   className="h-8 text-sm flex-1"
//                 />
//                 <Button
//                   size="sm"
//                   onClick={handleSubmitLocation}
//                   disabled={!location.trim()}
//                   className="h-8"
//                 >
//                   <Send className="h-3 w-3 mr-1" />
//                   Gửi
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//
//       {weatherInfo && (
//         <div className="bg-secondary/30 rounded-lg p-4 text-sm">
//           <h4 className="font-medium">Thông tin thời tiết - {weatherInfo.location}</h4>
//           <div className="mt-2 space-y-1">
//             <p>Nhiệt độ: {weatherInfo.temperature}°C</p>
//             <p>Điều kiện: {weatherInfo.condition}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default DiseaseDetails;