"use client"

import React, { useRef, useState } from "react"
import Button from "../elements/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBold,
  faItalic,
  faLink,
  faList,
  faListOl,
  faPlus,
  faStrikethrough,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons"
import { twMerge } from "tailwind-merge"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { getValidLink } from "@/utils/functionalUtils"

export default function RichtextToolbar({ editor }) {
  const popoverInputRef = useRef()
  const [popOverOpen, setPopOverOpen] = useState(false)

  const setLinkToText = (url) => editor?.chain().focus().setLink({ href: url, target: "_blank" }).run()

  return (
    <div className="mt-2 space-x-2 pt-1">
      {/* bold button */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("bold") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <FontAwesomeIcon icon={faBold} />
      </Button>

      {/* italic button */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("italic") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <FontAwesomeIcon icon={faItalic} />
      </Button>

      {/* underline */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("underline") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <FontAwesomeIcon icon={faUnderline} />
      </Button>

      {/* strike through */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("strike") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <FontAwesomeIcon icon={faStrikethrough} />
      </Button>

      {/* level 1 heading */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("heading", { level: 2 }) ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="font-bold">
          H<sub>1</sub>
        </span>
      </Button>

      {/* level 2 heading */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("heading", { level: 4 }) ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <span className="font-bold">
          H<sub>2</sub>
        </span>
      </Button>

      {/* level 3 heading */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("heading", { level: 6 }) ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()}
      >
        <span className="font-bold">
          H<sub>3</sub>
        </span>
      </Button>

      {/* ul list */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("bulletList") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <FontAwesomeIcon icon={faList} />
      </Button>

      {/* ol list */}
      <Button
        className={twMerge(
          "inline-block rounded-sm px-4 py-2",
          editor?.isActive("orderedList") ? "bg-purple-700 text-white" : "",
        )}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <FontAwesomeIcon icon={faListOl} />
      </Button>

      {/* Link */}
      <Popover open={popOverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={twMerge(
              "inline-block rounded-sm px-4 py-2",
              editor?.isActive("link") ? "bg-purple-700 text-white" : "",
            )}
            onClick={() => {
              editor?.isActive("link") ? editor?.chain().focus().unsetLink().run() : setPopOverOpen(true)
            }}
          >
            <FontAwesomeIcon icon={faLink} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="overflow-hidden rounded-md border-2 border-black bg-white"
          onEscapeKeyDown={() => setPopOverOpen(false)}
          onFocusOutside={() => setPopOverOpen(false)}
        >
          <input
            ref={popoverInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setLinkToText(getValidLink(popoverInputRef.current?.value))
                return setPopOverOpen(false)
              }
            }}
            type="text"
            placeholder="https://example.com"
            className="inline-block px-2 py-1 outline-none"
          />

          <Button
            className="inline-block p-1"
            onClick={() => {
              setLinkToText(getValidLink(popoverInputRef.current?.value))
              setPopOverOpen(false)
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
