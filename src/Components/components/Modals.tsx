
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Button1, Button2 } from "./Button";
import { Link } from "react-router";

interface SuccessModalProps{
    closeModal?: () => void;
    openModal?: () => void;
    isOpen?: boolean;
    children?: React.ReactNode
  
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
              className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-6 w-[90%] lg:max-w-md z-10"
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

export const SuccessModal2:React.FC<SuccessModalProps> = ({closeModal, isOpen}: SuccessModalProps) => {
 

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-40 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-6 lg:w-full w-[95%] max-w-md z-10"
            >
              <div className="text-center">
                <IoMdCheckmarkCircleOutline className="mx-auto h-12 w-12 text-[#FFD700]" />
                <h3 className="mt-2 lg:text-xl text-lg font-semibold">Sent Successfully! 🚀🎉</h3>
                <p className="mt-2 lg:text-sm text-xs">Your message has been sent successfully.</p>
                
                <div className="flex justify-center gap-4 m-auto mt-4">
                    <Button2 text="Close" onClick={closeModal}/>
                    <Link to={'/'}>
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


export const FaqModal:React.FC<SuccessModalProps> = ({closeModal, isOpen, children}: SuccessModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <AnimatePresence>
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
                  className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-5 w-[90%] lg:w-[30%] z-10"
                >{children}
                </motion.div>
              </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  )
}


export const CaseModal:React.FC<SuccessModalProps> = ({closeModal, isOpen, children}: SuccessModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm " />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl w-[90%] 2xl:h-[80vh] xl:h-[80vh] lg:h-[80vh] h-[90vh] overflow-y-scroll lg:w-[30%] z-10"
                >{children}
                </motion.div>
              </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  )
}