import React from 'react'
import { IoArrowForwardOutline } from "react-icons/io5";


interface ButtonProps {
    text: string;
    onClick?: () => void;
    isPending?: boolean
}

export const Button1: React.FC<ButtonProps> = ({text, onClick}: ButtonProps) => {
  return (
    <button className='flex !text-xs items-center bg-white text-[#080808] rounded-md px-4 py-2 w-fit' onClick={onClick}>{text}</button>
  )
}

export const Button2: React.FC<ButtonProps> = ({text, onClick}: ButtonProps) => {
  return (
    <button className='flex !text-xs items-center bg-neutral-800 hover:bg-[#202020] transition-all ease-linear delay-75 text-white border border-neutral-700 rounded-md px-4 py-2 w-fit' onClick={onClick}>
      {text}
    </button>
  )
}

export const Button2a: React.FC<ButtonProps> = ({text, onClick, isPending}: ButtonProps) => {
    return (
      <button className='flex !text-xs items-center bg-neutral-800 hover:bg-[#202020] transition-all ease-linear delay-75 text-white border border-neutral-700 rounded-md px-4 py-2 w-fit' onClick={onClick}>
        {isPending ? <p className='flex items-center gap-2'>
          <span className="loader"></span> Loading</p> : text
        }
      </button>
    )
}

export const Button3: React.FC<ButtonProps> = ({text, onClick}: ButtonProps) => {
  return (
    <button className='flex !text-xs gap-2 items-center bg-neutral-800 hover:bg-[#202020] transition-all ease-linear delay-75 text-white border border-neutral-700 rounded-md px-4 py-2 w-fit' onClick={onClick}>
      {text} <IoArrowForwardOutline />
    </button>
  )
}

export const Button4: React.FC<ButtonProps> = ({text, onClick}: ButtonProps) => {
  return (
    <button className='flex !text-xs items-center bg-neutral-800 hover:bg-[#202020] transition-all ease-linear delay-75 text-white border border-neutral-700 rounded-md px-4 py-2 lg:w-fit w-full' onClick={onClick}>{text}</button>
  )
}