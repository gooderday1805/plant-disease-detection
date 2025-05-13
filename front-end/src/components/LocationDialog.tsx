//
// import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
// import { Button } from '@/components/ui/button';
// import { useForm } from 'react-hook-form';
//
// interface LocationFormValues {
//   location: string;
// }
//
// interface LocationDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (values: LocationFormValues) => void;
// }
//
// const LocationDialog = ({ open, onOpenChange, onSubmit }: LocationDialogProps) => {
//   const form = useForm<LocationFormValues>({
//     defaultValues: {
//       location: ''
//     }
//   });
//
//   const handleSubmit = (values: LocationFormValues) => {
//     onSubmit(values);
//     form.reset();
//   };
//
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Nhập vị trí của bạn</DialogTitle>
//           <DialogDescription>
//             Vui lòng cung cấp vị trí để nhận thông tin thời tiết và khuyến nghị điều trị phù hợp
//           </DialogDescription>
//         </DialogHeader>
//
//         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="location"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Vị trí (thành phố hoặc tỉnh)</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." {...field} />
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//
//           <div className="flex justify-end gap-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               Hủy
//             </Button>
//             <Button type="submit">Xác nhận</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };
//
// export default LocationDialog;
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

interface LocationFormValues {
  location: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => void;
}

const LocationDialog = ({ open, onOpenChange, onSubmit }: LocationDialogProps) => {
  const form = useForm<LocationFormValues>({
    defaultValues: {
      location: ''
    }
  });

  const handleSubmit = (values: LocationFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập tỉnh/thành phố của bạn</DialogTitle>
          <DialogDescription>
            Nhập tên tỉnh/thành phố để backend trả về thông báo chào
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/thành phố</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Gửi</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
