import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users,
  Hammer,
  Camera,
  TrendingUp,
  Plus,
  Home
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  acquired: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  in_renovation: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  completed: "bg-green-600/20 text-green-300 border-green-500/30",
  occupied: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  sold: "bg-gray-600/20 text-gray-300 border-gray-500/30"
};

export default function PropertyPortfolio({ properties, workOrders }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-green-100">Property Portfolio</h2>
          <Badge className="bg-green-600/20 text-green-300">
            {properties.length} properties
          </Badge>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Acquire Property
        </Button>
      </div>

      <div className="grid gap-6">
        {properties.map((property) => {
          const propertyWorkOrders = workOrders.filter(wo => wo.property_id === property.id);
          const renovationProgress = property.actual_renovation_cost && property.estimated_renovation_cost 
            ? Math.min((property.actual_renovation_cost / property.estimated_renovation_cost) * 100, 100)
            : 0;

          return (
            <Card key={property.id} className="bg-gradient-to-br from-green-600/10 to-black/40 backdrop-blur-sm border border-green-700/30 hover:border-green-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600/40 rounded-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-100">{property.address}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusColors[property.property_status]}>
                          {property.property_status.replace('_', ' ')}
                        </Badge>
                        <Badge className="bg-blue-600/20 text-blue-300">
                          {property.property_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ${property.acquisition_price?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-green-300">Acquisition Cost</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Property Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Property Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-300">Square Footage:</span>
                        <span className="text-green-100">{property.square_footage?.toLocaleString() || 'N/A'} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Bedrooms:</span>
                        <span className="text-green-100">{property.bedrooms || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Bathrooms:</span>
                        <span className="text-green-100">{property.bathrooms || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Acquired:</span>
                        <span className="text-green-100">
                          {property.acquisition_date ? format(new Date(property.acquisition_date), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Renovation Progress */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-200 flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      Renovation Progress
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-green-300">
                        <span>Budget Usage</span>
                        <span>${property.actual_renovation_cost?.toLocaleString() || '0'} / ${property.estimated_renovation_cost?.toLocaleString() || '0'}</span>
                      </div>
                      <Progress value={renovationProgress} className="h-2" />
                      <div className="text-center text-green-300 text-xs">
                        {Math.round(renovationProgress)}% Complete
                      </div>
                    </div>
                    
                    {property.assigned_participants && property.assigned_participants.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-green-300 mb-1">Assigned Participants</div>
                        <Badge className="bg-green-600/20 text-green-300">
                          <Users className="w-3 h-3 mr-1" />
                          {property.assigned_participants.length} workers
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Work Orders */}
                {propertyWorkOrders.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-700/30">
                    <h4 className="font-semibold text-green-200 mb-2 flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      Active Work Orders ({propertyWorkOrders.length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {propertyWorkOrders.slice(0, 4).map((wo) => (
                        <div key={wo.id} className="p-2 bg-green-900/20 rounded-lg border border-green-700/20">
                          <div className="text-sm text-green-200 font-medium">{wo.title}</div>
                          <div className="text-xs text-green-300/70">{wo.work_category} • {wo.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Projections */}
                <div className="mt-4 pt-4 border-t border-green-700/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-900/20 rounded-lg">
                      <div className="text-green-400 font-semibold">${property.projected_rent_to_own_price?.toLocaleString() || 'TBD'}</div>
                      <div className="text-green-300/70 text-xs">Target Sale Price</div>
                    </div>
                    <div className="text-center p-3 bg-green-900/20 rounded-lg">
                      <div className="text-green-400 font-semibold">${property.monthly_rent_amount?.toLocaleString() || 'TBD'}</div>
                      <div className="text-green-300/70 text-xs">Monthly Rent</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-green-700/30">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    View Photos
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Manage Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {properties.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30 text-center p-12">
          <Building className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
          <h3 className="text-xl font-semibold text-green-200 mb-2">No Properties Yet</h3>
          <p className="text-green-300/70 mb-6">Start by acquiring your first property to rehabilitate</p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Acquire First Property
          </Button>
        </Card>
      )}
    </div>
  );
}