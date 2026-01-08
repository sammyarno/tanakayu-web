import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLUSTER_LIST } from '@/data/clusters';
import { MapPin } from 'lucide-react';

interface ResidenceCardProps {
  isLoading: boolean;
  isEditing: boolean;
}

export const ResidenceCard = ({ isLoading, isEditing }: ResidenceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="text-primary h-5 w-5" />
          Residence Details
        </CardTitle>
        <CardDescription>Where do you live?</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="cluster">Cluster</Label>
          <FormController
            name="cluster"
            renderInput={field => (
              <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing || isLoading}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  {CLUSTER_LIST.map(cluster => (
                    <SelectItem key={cluster} value={cluster} className="capitalize">
                      {cluster}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <FormController
            name="address"
            renderInput={field => <Input {...field} placeholder="Block/Number" disabled={!isEditing || isLoading} />}
          />
        </div>
      </CardContent>
    </Card>
  );
};
