"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    entityName?: string;
}

export function Combobox({ options, value, onChange, entityName = 'item' }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const handleSelect = (currentValue: string) => {
    // 始终设置为选择的值，不进行“再次选择即清空”的切换，避免将分组错误置为空字符串
    onChange(currentValue)
    setOpen(false)
    setSearch("")
  }

  const handleCreateNew = () => {
    if (search && !options.find(opt => opt.value.toLowerCase() === search.toLowerCase())) {
        onChange(search);
        setOpen(false);
        setSearch("");
    }
  }

  const currentOption = options.find((option) => option.value.toLowerCase() === value?.toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {currentOption ? currentOption.label : `选择一个${entityName}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`搜索或创建新的${entityName}...`}
            value={search}
            onValueChange={setSearch}
            onKeyDown={(e) => {
                if(e.key === 'Enter') {
                    handleCreateNew();
                }
            }}
            onBlur={() => {
              // 允许直接输入后点击外部创建新分组
              if (search && !options.find(opt => opt.value.toLowerCase() === search.toLowerCase())) {
                handleCreateNew();
              }
            }}
          />
          <CommandList>
            <CommandEmpty onSelect={handleCreateNew}>
                {search ? `创建新${entityName} "${search}"` : `没有找到${entityName}。`}
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
                .map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
             {search && !options.find(opt => opt.value.toLowerCase() === search.toLowerCase()) && (
                <>
                    <CommandSeparator />
                    <CommandGroup>
                        <CommandItem onSelect={handleCreateNew} value={search}>
                            <span className="mr-2 h-4 w-4" />
                           {`创建新${entityName}: "${search}"`}
                        </CommandItem>
                    </CommandGroup>
                </>
             )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
