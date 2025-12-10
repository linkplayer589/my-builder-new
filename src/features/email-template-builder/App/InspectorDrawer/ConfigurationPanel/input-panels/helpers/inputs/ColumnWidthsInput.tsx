// import React, { useState } from 'react';

// import { Stack } from '@mui/material';

// import TextDimensionInput from './TextDimensionInput';

// export const DEFAULT_2_COLUMNS = [6] as [number];
// export const DEFAULT_3_COLUMNS = [4, 8] as [number, number];

// type TWidthValue = number | null | undefined;
// type FixedWidths = [
//   //
//   number | null | undefined,
//   number | null | undefined,
//   number | null | undefined,
// ];
// type ColumnsLayoutInputProps = {
//   defaultValue: FixedWidths | null | undefined;
//   onChange: (v: FixedWidths | null | undefined) => void;
// };
// export default function ColumnWidthsInput({ defaultValue, onChange }: ColumnsLayoutInputProps) {
//   const [currentValue, setCurrentValue] = useState<[TWidthValue, TWidthValue, TWidthValue]>(() => {
//     if (defaultValue) {
//       return defaultValue;
//     }
//     return [null, null, null];
//   });

//   const setIndexValue = (index: 0 | 1 | 2, value: number | null | undefined) => {
//     const nValue: FixedWidths = [...currentValue];
//     nValue[index] = value;
//     setCurrentValue(nValue);
//     onChange(nValue);
//   };

//   const columnsCountValue = 3;
//   let column3 = null;
//   if (columnsCountValue === 3) {
//     column3 = (
//       <TextDimensionInput
//         label="Column 3"
//         defaultValue={currentValue?.[2]}
//         onChange={(v) => {
//           setIndexValue(2, v);
//         }}
//       />
//     );
//   }
//   return (
//     <Stack direction="row" spacing={1}>
//       <TextDimensionInput
//         label="Column 1"
//         defaultValue={currentValue?.[0]}
//         onChange={(v) => {
//           setIndexValue(0, v);
//         }}
//       />
//       <TextDimensionInput
//         label="Column 2"
//         defaultValue={currentValue?.[1]}
//         onChange={(v) => {
//           setIndexValue(1, v);
//         }}
//       />
//       {column3}
//     </Stack>
//   );
// }

// ColumnWidthsInput.tsx - REPLACE this file with:
import React from "react"
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material"

type ColumnWidthsInputProps = {
  defaultValue?: string
  onChange: (value: string) => void
}

const WIDTH_PRESETS = [
  { label: "1 Column", patterns: ["100%"] },
  {
    label: "2 Columns",
    patterns: [
      "50% 50%",
      "33% 67%",
      "67% 33%",
      "20% 80%",
      "80% 20%",
      "10% 90%",
    ],
  },
  {
    label: "3 Columns",
    patterns: ["33% 33% 33%", "25% 50% 25%", "20% 60% 20%", "40% 20% 40%"],
  },
  {
    label: "4 Columns",
    patterns: [
      "25% 25% 25% 25%",
      "17% 33% 17% 33%",
      "33% 17% 33% 17%",
      "20% 30% 30% 20%",
    ],
  },
]

export default function ColumnWidthsInput({
  defaultValue = "",
  onChange,
}: ColumnWidthsInputProps) {
  const handleChange = (e: any) => {
    if (typeof onChange === "function") {
      onChange(e.target.value)
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Column Widths</InputLabel>
        <Select
          value={defaultValue}
          label="Column Widths"
          onChange={handleChange}
          renderValue={(value) => {
            if (!value) return "Auto (equal width)"
            return value
          }}
        >
          <MenuItem value="">
            <em>Auto (equal width)</em>
          </MenuItem>

          {WIDTH_PRESETS.flatMap((group) => [
            <ListSubheader key={`header-${group.label}`}>
              {group.label}
            </ListSubheader>,
            ...group.patterns.map((pattern) => (
              <MenuItem key={pattern} value={pattern}>
                {pattern}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>
    </Box>
  )
}
