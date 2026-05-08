"use client";

import type { FC, PropsWithChildren } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { HeadingContext } from "../heading/heading";

type Props = VariantProps<typeof styles>;

export const Main: FC<PropsWithChildren<Props>> = ({ width, children }) => {
  return (
    <HeadingContext value={1}>
      <main className={styles({ width })}>{children}</main>
    </HeadingContext>
  );
};

const styles = tv({
  base: "mx-auto w-full p-4",
  variants: {
    width: {
      narrow: "max-w-2xl",
      wide: "max-w-screen-xl",
    },
  },
  defaultVariants: {
    width: "narrow",
  },
});
