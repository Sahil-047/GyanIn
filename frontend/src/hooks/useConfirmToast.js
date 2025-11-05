import { useState, useCallback } from 'react'

export const useConfirmToast = () => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null,
    })

    const showConfirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                confirmText: options.confirmText || 'OK',
                cancelText: options.cancelText || 'Cancel',
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }))
                    resolve(true)
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }))
                    resolve(false)
                },
            })
        })
    }, [])

    return {
        confirmState,
        showConfirm,
    }
}

