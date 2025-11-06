import { useRef, useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { uploadsAPI } from '../../utils/api'
import { useEdgeStore } from '../../edgestore'

const ImageUploader = ({ value, onChange, buttonText = 'Upload Image', bucketType = 'teacher', disableCrop = false }) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [isDragOver, setIsDragOver] = useState(false)
    const [showCropModal, setShowCropModal] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const inputRef = useRef(null)

    const { edgestore } = useEdgeStore()

    const createImage = (url) => {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.src = url
        })
    }

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: false })

        if (!ctx) {
            throw new Error('No 2d context')
        }

        // Limit maximum canvas size to prevent memory issues (max 2000px)
        const MAX_SIZE = 2000
        const scale = Math.min(1, MAX_SIZE / Math.max(pixelCrop.width, pixelCrop.height))

        canvas.width = Math.round(pixelCrop.width * scale)
        canvas.height = Math.round(pixelCrop.height * scale)

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw image with scaling
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            canvas.width,
            canvas.height
        )

        // Use lower quality for smaller images to reduce file size
        const quality = canvas.width > 1000 ? 0.92 : 0.85

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                // Clean up canvas
                canvas.width = 0
                canvas.height = 0
                const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
                resolve(file)
            }, 'image/jpeg', quality)
        })
    }

    // Optimized crop complete to reduce re-renders
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            setCroppedAreaPixels(croppedAreaPixels)
        })
    }, [])

    const handleCropConfirm = async () => {
        if (!imageToCrop || !croppedAreaPixels) {
            setError('Please crop the image first')
            return
        }

        setUploading(true)
        setError('')
        try {
            const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels)
            await uploadCroppedFile(croppedFile)
            // Cleanup object URL after successful upload
            if (imageToCrop) {
                URL.revokeObjectURL(imageToCrop)
            }
            setShowCropModal(false)
            setImageToCrop(null)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setCroppedAreaPixels(null)
        } catch (err) {
            setError(err.message || 'Failed to crop image')
            setUploading(false)
        }
    }

    const handleCropCancel = () => {
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop)
        }
        setShowCropModal(false)
        setImageToCrop(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        setError('')
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const uploadCroppedFile = async (file) => {
        try {
            // Prefer client-side Edge Store SDK if available
            if (edgestore && edgestore[bucketType === 'course' ? 'Courses' : 'Teachers']) {
                const result = await edgestore[bucketType === 'course' ? 'Courses' : 'Teachers'].upload({ file })
                if (result?.url) {
                    onChange(result.url)
                    setUploading(false)
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

    const handleFileSelect = useCallback(async (file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        setError('')
        setImageLoading(true)

        try {
            // If cropping is disabled, upload directly without showing crop modal
            if (disableCrop) {
                setUploading(true)
                try {
                    // Prefer client-side Edge Store SDK if available
                    if (edgestore && edgestore[bucketType === 'course' ? 'Courses' : 'Teachers']) {
                        const result = await edgestore[bucketType === 'course' ? 'Courses' : 'Teachers'].upload({ file })
                        if (result?.url) {
                            onChange(result.url)
                            setImageLoading(false)
                            setUploading(false)
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
                } catch (uploadErr) {
                    setError(uploadErr.message || 'Upload failed')
                } finally {
                    setUploading(false)
                    setImageLoading(false)
                }
                return
            }

            // Create image URL for cropping
            const imageUrl = URL.createObjectURL(file)

            // Verify image loads before showing modal
            const img = new Image()
            img.onload = () => {
                setImageToCrop(imageUrl)
                setShowCropModal(true)
                setImageLoading(false)
            }
            img.onerror = () => {
                setError('Failed to load image. Please try another file.')
                URL.revokeObjectURL(imageUrl)
                setImageLoading(false)
            }
            img.src = imageUrl
        } catch (err) {
            setError('Failed to process image. Please try another file.')
            setImageLoading(false)
            setUploading(false)
        }
    }, [disableCrop, edgestore, bucketType, onChange])

    const handleInputChange = (e) => {
        const file = e.target.files?.[0]
        handleFileSelect(file)
        // Reset input to allow selecting same file again
        if (e.target) {
            e.target.value = ''
        }
    }

    const onDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        const file = e.dataTransfer?.files?.[0]
        handleFileSelect(file)
    }, [handleFileSelect])

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (imageToCrop) {
                URL.revokeObjectURL(imageToCrop)
            }
        }
    }, [imageToCrop])

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
            {/* Crop Modal */}
            {showCropModal && imageToCrop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleCropCancel()
                    }
                }}>
                    <div className="bg-white rounded-lg shadow-xl p-4 max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Image</h3>
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width: '100%', height: '500px', minHeight: '400px' }}>
                            {imageToCrop && (
                                <Cropper
                                    image={imageToCrop}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                    cropShape="rect"
                                    showGrid={true}
                                />
                            )}
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Zoom:</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => {
                                        const newZoom = parseFloat(e.target.value)
                                        setZoom(newZoom) // Immediate update for UI
                                    }}
                                    className="flex-1"
                                />
                                <span className="text-sm text-gray-600 w-12">{zoom.toFixed(1)}x</span>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    disabled={uploading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropConfirm}
                                    disabled={uploading || !croppedAreaPixels}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Crop & Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                {imageLoading ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-2 py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-600">Loading image...</p>
                    </div>
                ) : !value ? (
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
                            onClick={(e) => {
                                e.stopPropagation()
                                inputRef.current?.click()
                            }}
                            disabled={uploading || imageLoading}
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    inputRef.current?.click()
                                }}
                                disabled={uploading}
                            >
                                Change
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeImage()
                                }}
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


