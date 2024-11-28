import { FixedSizeList as List } from "react-window";
import React from "react";

const VirtualizedMenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const height = 35; // Height of each item
  const selected = getValue()?.[0] || null;
  const initialOffset =
    options.findIndex((option: any) => option.value === selected?.value) *
    height;

  return (
    <List
      height={Math.min(maxHeight, options.length * height)}
      initialScrollOffset={initialOffset}
      itemCount={options.length}
      itemSize={height}
      style={{ overflow: "auto" }}
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </List>
  );
};

export default VirtualizedMenuList;
