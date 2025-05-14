import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { LoaderCircle } from 'lucide-react';

interface LocationFormValues {
  location: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => void;
}

const LocationDialog = ({ open, onOpenChange, onSubmit }: LocationDialogProps) => {
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const form = useForm<LocationFormValues>({
    defaultValues: {
      location: ''
    }
  });

  const handleSubmit = (values: LocationFormValues) => {
    onSubmit(values);
    form.reset();
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setIsLoadingGeolocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Convert coordinates to city name using reverse geocoding API
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location: ", error);
        setIsLoadingGeolocation(false);
        alert("Không thể lấy vị trí. Vui lòng nhập thủ công.");
      }
    );
  };
  
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'weather-checker/1.0 (contact: taivan1805)',
            'Accept-Language': 'vi',
          },
        }
      );

      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || data.address.county || "Không rõ vị trí";
      const state = data.address.state || data.address.region || "";
      const country = data.address.country || "";

      const fullLocation = `${city}, ${state} ${country}`.trim();

      form.setValue('location', fullLocation);
      onSubmit({ location: fullLocation });
      setIsLoadingGeolocation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi reverse geocode: ", error);
      setIsLoadingGeolocation(false);
      alert("Không thể xác định thành phố. Vui lòng nhập thủ công.");
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập vị trí của bạn</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp thành phố hoặc tỉnh để nhận thông tin thời tiết và khuyến nghị điều trị phù hợp
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí (thành phố hoặc tỉnh)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="outline"
              onClick={getGeolocation}
              disabled={isLoadingGeolocation}
              className="w-full"
            >
              {isLoadingGeolocation ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Đang lấy vị trí...
                </>
              ) : (
                "Tự động xác định vị trí"
              )}
            </Button>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Xác nhận</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;