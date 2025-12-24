"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSectionCardProps } from "./types";
import FormField from "./FormField";
import { getColorClasses } from "./utils";

export default function FormSectionCard({ section, formData, onFieldChange }: FormSectionCardProps) {
  const colors = getColorClasses(section.color);
  const SectionIcon = section.icon;

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
            <SectionIcon className={`size-4 ${colors.iconColor}`} />
          </div>
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <div 
          className={`grid gap-4 ${
            section.columns === 3 
              ? 'grid-cols-1 sm:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {section.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={String(formData[field.name] || "")}
              onChange={onFieldChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

