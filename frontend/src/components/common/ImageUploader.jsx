import { useRef, useState, useCallback } from 'react'
import { uploadsAPI } from '../../utils/api'
import { useEdgeStore } from '../../edgestore'

const ImageUploader = ({ value, onChange, buttonText = 'Upload Image', bucketType = 'teacher' }) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [isDragOver, setIsDragOver] = useState(false)
    const inputRef = useRef(null)

    const { edgestore } = useEdgeStore()

    const uploadFile = async (file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        setError('')
        setUploading(true)
        try {
            // Prefer client-side Edge Store SDK if available
            if (edgestore && edgestore[bucketType === 'course' ? 'Courses' : 'Teachers']) {
                const result = await edgestore[bucketType === 'course' ? 'Courses' : 'Teachers'].upload({ file })
                if (result?.url) {
                    onChange(result.url)
                    return
                }
            }

            // Fallback to server endpoint
            const res = await uploadsAPI.uploadImage(file, bucketType)
            if (res.success && res.url) {
                onChange(res.url)
            } else {
                setError(res.message || 'Upload not available')
            }
        } catch (err) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleInputChange = (e) => uploadFile(e.target.files?.[0])

    const onDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        const file = e.dataTransfer?.files?.[0]
        uploadFile(file)
    }, [])

    const onDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
    }

    const onDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const removeImage = () => {
        onChange('')
        setError('')
    }

    return (
        <div className="space-y-2">
            <div
                className={`mt-1 border-2 border-dashed rounded-md p-4 transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
            >
                {!value ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v0m12 0v0a2 2 0 00-2-2m-8 0l-2 2m0 0L3 7m3-2l2 2" />
                        </svg>
                        <div className="text-sm text-gray-700">
                            <span className="font-medium text-blue-600 cursor-pointer">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF up to 5MB</p>
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading…' : buttonText}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                                <img src={value} alt="preview" className="h-full w-full object-cover" />
                            </div>
                            <a href={value} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline break-all">
                                View full image
                            </a>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading}
                            >
                                Change
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
                                onClick={removeImage}
                                disabled={uploading}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploading}
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}

export default ImageUploader


