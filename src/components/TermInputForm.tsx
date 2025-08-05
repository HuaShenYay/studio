"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  term: z.string().min(2, {
    message: "Term must be at least 2 characters.",
  }).max(50, {
      message: "Term must not exceed 50 characters."
  }),
  explanation: z.string().min(10, {
      message: "Explanation must be at least 10 characters."
  }).max(500, {
      message: "Explanation must not exceed 500 characters."
  })
});

type TermInputFormProps = {
    onAddTerm: (term: string, explanation: string) => Promise<void>;
    isLoading: boolean;
}

export default function TermInputForm({ onAddTerm, isLoading }: TermInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      term: "",
      explanation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddTerm(values.term, values.explanation);
    form.reset();
  }

  return (
    <Card className="overflow-hidden shadow-lg">
        <CardHeader>
            <CardTitle>Add a New Term</CardTitle>
            <CardDescription>Enter a literary term and its explanation to generate a practice exercise.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Literary Term</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Sonnet" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="e.g., A poem of fourteen lines using any of a number of formal rhyme schemes..."
                            className="resize-none"
                            {...field}
                        />
                    </FormControl>
                     <FormDescription>
                        Our AI will create a fill-in-the-blank question from this.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Generate Exercise
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
