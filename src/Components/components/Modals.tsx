
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Button1, Button2 } from "./Button";
import { Link } from "react-router-dom";

interface SuccessModalProps{
    closeModal: () => void;
    openModal: () => void;
    isOpen: boolean;
  
}
export const SuccessModal:React.FC<SuccessModalProps> = ({closeModal, isOpen}: SuccessModalProps) => {
 

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-6 w-full max-w-md z-10"
            >
              <div className="text-center">
                <IoMdCheckmarkCircleOutline className="mx-auto h-12 w-12 text-[#FFD700]" />
                <h3 className="mt-2 text-xl font-semibold">Message Sent!</h3>
                <p className="mt-2 text-sm">Your message has been sent successfully.</p>
                
                <div className="flex justify-center gap-4 m-auto mt-4">
                    <Button2 text="Close" onClick={closeModal}/>
                    <Link to={'/contact'}>
                        <Button1 text='Continue'/>
                    </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

