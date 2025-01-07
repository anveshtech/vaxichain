"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import React, { useState } from "react"
import StarterKit from "@tiptap/starter-kit"
import RichtextToolbar from "./richtext-toolbar"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { Controller } from "react-hook-form"
import { twMerge } from "tailwind-merge"

export default function Richtext({ formContext, required, placeholder, name }) {
  const { control, errors, setValue, getValues } = formContext()

  const [placeHolderOnTop, setPlaceHolderOnTop] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.extend({ inclusive: false }).configure({
        validate: (url) => /^(http:\/\/|https:\/\/)[a-zA-Z0-9]{3,}\.[a-zA-Z0-9]+/g.test(url),
        // for auto links only
        // incluve false means the next typed words won't  be link anymore
      }),
      // Placeholder.configure({ placeholder: `${placeholder} ${required ? "*" : ""}` }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => setValue(name, editor.getHTML(), { shouldValidate: true }), //this is what provides value for validation on below validate rule
  })

  return (
    <div
      className={twMerge(
        "relative z-10 divide-y-2 divide-[#bbb] rounded-md border-2 p-2",
        errors[name] ? "border-red-600" : "border-[#bbb]",
      )}
    >
      <Controller
        control={control}
        rules={{
          required: {
            value: true,
          },
          validate: (value) => {
            if (value?.toString().trim() === "<p></p>") return "error"

            return true
          },
        }}
        name={name}
        render={({ field }) => (
          <EditorContent
            editor={editor}
            {...field}
            onFocus={() => setPlaceHolderOnTop(true)}
            onBlur={() => {
              const fieldValue = getValues(name)?.trim()

              if (fieldValue && fieldValue !== "<p></p>") return

              return setPlaceHolderOnTop(false)
            }}
          />
        )}
      />

      <span
        className={twMerge(
          "absolute left-2 top-6 -z-10 -translate-y-1/2 border-none bg-white px-2 opacity-50 transition-all duration-300 hover:cursor-text",
          placeHolderOnTop ? "top-0 z-10 text-xs opacity-100" : "",
          errors[name] ? (placeHolderOnTop ? "text-red-600" : "") : "",
        )}
      >
        {placeholder} {required ? "*" : ""}
      </span>

      <RichtextToolbar editor={editor} />
    </div>
  )
}
