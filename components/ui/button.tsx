import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const baseClassName =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

export type ButtonVariant =
  | "default"
  | "warning"
  | "destructive"
  | "destructive-outline"
  | "outline"
  | "outline-primary"
  | "secondary"
  | "ghost"
  | "ghost-hover"
  | "link"
  | "link-foreground"
  | "neumorphic-primary"
  | "clean"
  | "view-wrapped";
export type ButtonSize = "default" | "sm" | "lg" | "icon" | "clean";

const buttonVariants = cva(baseClassName, {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      warning:
        "bg-yellow-300/20 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-900 shadow-sm hover:bg-yellow-300/30 hover:dark:bg-yellow-500/30 border border-yellow-500/10",
      destructive:
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      "destructive-outline":
        "border border-destructive/50 text-destructive shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground",
      outline:
        "border border-input bg-background shadow-sm hover:bg-primary hover:text-primary-foreground",
      "outline-primary":
        "border border-primary/40 bg-background shadow-sm hover:border-primary/80 hover:!bg-primary/10 text-primary",
      secondary:
        "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-primary hover:text-primary-foreground",
      "ghost-hover":
        "hover:bg-primary hover:text-primary-foreground hover:text-primary",
      link: "text-primary underline-offset-4 hover:underline",
      "link-foreground":
        "text-foreground/90 underline-offset-4 hover:underline hover:text-foreground hover:underline",
      "neumorphic-primary":
        "rounded-md bg-gradient-to-b from-primary via-primary/80 to-primary/60 text-primary-foreground shadow-md border !border-primary px-4 py-2 transition-colors font-semibold",
      clean: "!p-0",
      "view-wrapped":
        "inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white !px-8 !py-4 !rounded-2xl !font-semibold !text-lg !shadow-xl hover:shadow-2xl transition-all hover:scale-105",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
      clean: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  clean?: boolean;
  ghost?: boolean; // show the little ghost icon on the right
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      clean = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = clean
      ? cn(baseClassName, className)
      : cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      // Enforce exactly one child and inject the icon into that element's children
      const onlyChild = React.Children.only(
        children,
      ) as React.ReactElement<React.ComponentProps<"button">>;
      return React.cloneElement(onlyChild, {
        ...props,
        ref: ref as React.Ref<HTMLButtonElement>,
        className: cn(classes, onlyChild.props.className),
        children: <>{onlyChild.props.children}</>,
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button, buttonVariants };
