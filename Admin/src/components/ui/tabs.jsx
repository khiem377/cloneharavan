import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

export function Tabs({ value, defaultValue, onValueChange, className, children, ...props }) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  const currentVal = value !== undefined ? value : selectedValue;
  const handleValueChange = (val) => {
    if (value === undefined) setSelectedValue(val);
    if (onValueChange) onValueChange(val);
  };

  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  return (
    <TabsContext.Provider value={{ value: currentVal, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-[6px] bg-secondary/70 p-0.5 text-muted-foreground border border-border gap-0.5",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[4px] px-3 py-1 text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98]",
        isSelected
          ? "bg-background text-foreground shadow-2xs font-bold"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-3 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
