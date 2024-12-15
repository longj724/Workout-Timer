import { View } from 'react-native';
import { createContext, useContext } from 'react';

const DialogContext = createContext({});

interface DialogRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ children, ...props }: DialogRootProps) {
  return (
    <DialogContext.Provider value={props}>
      <View className="absolute inset-0 bg-background/80">{children}</View>
    </DialogContext.Provider>
  );
}
Dialog.Content = function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`bg-card rounded-lg m-4 ${className}`}>{children}</View>
  );
};

Dialog.Header = function DialogHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View className="mb-4">{children}</View>;
};

Dialog.Title = function DialogTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View className="text-foreground text-xl font-semibold">{children}</View>
  );
};

Dialog.Footer = function DialogFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View className="flex-row">{children}</View>;
};
