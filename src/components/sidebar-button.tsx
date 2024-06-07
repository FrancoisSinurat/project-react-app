import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface SidebarButtonProps extends ButtonProps {

  icon?: LucideIcon;

}

export function SidebarButton({ 

  icon: Icon,

  className,
  
  children,

  ...props 

}: SidebarButtonProps) {

  return (

    <Button 

      variant='ghost' 

      className={cn('gap-2 justify-start', className)} 

      {...props}

    >

      {Icon && <Icon size={25} />}

      <span>{children}</span>

    </Button>  

  );
}
