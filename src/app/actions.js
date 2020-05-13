import firebase from './../firebase'
import domtoimage from 'dom-to-image'
import html2canvas from 'html2canvas'

export const RESET_PROGRESS = "RESET_PROGRESS"

export const SET_IMAGE = "SET_IMAGE"
export const SET_PREVIEW_TEXT = "SET_PREVIEW_TEXT"
export const SET_PREVIEW_BOLD_TEXT = "SET_PREVIEW_BOLD_TEXT"
export const SET_PREVIEW_BACKGROUND = "SET_PREVIEW_BACKGROUND"
export const SET_ACTIVE_PREVIEW = "SET_ACTIVE_PREVIEW"

export const SET_PREVIEW_MODE = "SET_PREVIEW_MODE"

export const UPLOAD_IMAGE_FAILURE = "UPLOAD_IMAGE_FAILURE"
export const UPLOAD_IMAGE_START = "UPLOAD_IMAGE_START"
export const UPLOAD_IMAGE_SUCCESS = "UPLOAD_IMAGE_SUCCESS"

export const DOWNLOAD_RESULT_FAILURE = "DOWNLOAD_RESULT_FAILURE"
export const DOWNLOAD_RESULT_START = "DOWNLOAD_RESULT_START"
export const DOWNLOAD_RESULT_SUCCESS = "DOWNLOAD_RESULT_SUCCESS"

export const ERROR_NOTIFY = "ERROR_NOTIFY"
export const ERROR_HIDE = "ERROR_HIDE"

export const RESET_CHANGES = "RESET_CHANGES"
export const RETURN_RESET = "RETURN_RESET"

const analytics = firebase.analytics()

const resetProgress = (payload) => ({
  type: RESET_PROGRESS,
  payload
})

const setImage = (payload) => ({
  type: SET_IMAGE,
  payload
})

const setPreviewText = (payload) => ({
  type: SET_PREVIEW_TEXT,
  payload
})

const setPreviewBoldText = (payload) => ({
  type: SET_PREVIEW_BOLD_TEXT,
  payload
})

const setPreviewBackground = (payload) => ({
  type: SET_PREVIEW_BACKGROUND,
  payload
})

const setActivePreview = (payload) => ({
  type: SET_ACTIVE_PREVIEW,
  payload
})

const setPreviewMode = (payload) => ({
  type: SET_PREVIEW_MODE,
  payload
})

const uploadImageStart = (payload) => ({
  type: UPLOAD_IMAGE_START,
  payload
})

const uploadImageSuccess = (payload) => ({
  type: UPLOAD_IMAGE_SUCCESS,
  payload
})

const uploadImageFailure = (payload) => ({
  type: UPLOAD_IMAGE_FAILURE,
  payload
})

const downloadResultStart = (payload) => ({
  type: DOWNLOAD_RESULT_START,
  payload
})

const downloadResultSuccess = (payload) => ({
  type: DOWNLOAD_RESULT_SUCCESS,
  payload
})

const downloadResultFailure = (payload) => ({
  type: DOWNLOAD_RESULT_FAILURE,
  payload
})

const errorNotify = (payload) => ({
  type: ERROR_NOTIFY,
  payload
})

const resetChanges = (payload) => ({
  type: RESET_CHANGES,
  payload
})

const returnReset = (payload) => ({
  type: RETURN_RESET,
  payload
})

const errorHide = (payload) => ({
  type: ERROR_HIDE,
  payload
})

export const dataURItoBlob = (dataURI) => {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'image/png' });
}

export const setErrorMessage = (errorMessage) => dispatch => {
  dispatch(errorNotify({
    errorMessage
  }))
  setTimeout(() => {
    dispatch(errorHide({
      errorMessage: ""
    }))
  }, 3500)
}

export const doUploadImage = (dataUrl) => dispatch => {
  var upload = firebase.functions().httpsCallable('upload');
  const data = {
    dataUrl: dataUrl
  }
  return upload(JSON.stringify(data))
  .then(response => {
    analytics.logEvent("cloudinary_upload_complete")
    const data = JSON.parse(response.data)
    dispatch(uploadImageSuccess({
      uploadUrl: data.secure_url,
      uploading: false
    }))
  })
  .catch((error) => { 
    dispatch(uploadImageFailure({
      uploading: false
    }))
    console.log(error)
    analytics.logEvent("cloudinary_upload_fail")
    dispatch(setErrorMessage("There was an error generating the Image, Please try again"))
  })
}

export const doSetImage = (imageUrl) => (dispatch) => {
  return dispatch(setImage({
    imageUrl
  }))
}

export const doSetPreviewText = (previewText) => (dispatch) => {
  return dispatch(setPreviewText({
    previewText
  }))
}

export const doSetPreviewBoldText = (previewBoldText) => (dispatch) => {
  return dispatch(setPreviewBoldText({
    previewBoldText
  }))
}

export const doSetPreviewBackground = (previewBackground) => (dispatch) => {
  return dispatch(setPreviewBackground({
    previewBackground
  }))
}

export const doSetActivePreview = (selectedPreview) => (dispatch) => {
  return dispatch(setActivePreview({
    selectedPreview
  }))
}

export const doSetPreviewMode = (previewMode) => (dispatch) => {
  analytics.logEvent("continue_to_preview")
  if (previewMode) {
    return dispatch(setPreviewMode({
      previewMode
    }))
  } else {
    return dispatch(setPreviewMode({
      previewMode,
      uploadUrl: "",
      generalUrl: ""
    }))
  }
}

export const doResetChanges = () => (dispatch) => {
  analytics.logEvent("restart_editing")
  dispatch(resetChanges({
    previewMode: false,
    imageUrl: "",
    previewText: "",
    previewBoldText: "I will",
    previewBackground: "",
    selectedPreview: "image",
    reset: true,
    uploadUrl: "",
    generalUrl: ""
  }))
  setTimeout(() => {
    dispatch(returnReset({
      reset: false
    }))
  }, 100)
}

export const doDownloadImage = (selectedPreview) => async dispatch => {
  let isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  dispatch(downloadResultStart({
    isIOS: isIOS,
    generalUrl: "",
    uploadUrl: ""
  }))
  dispatch(uploadImageStart({
    uploading: true
  }))
  if (isIOS) {   
    let me = await window.scrollTo(0,0);
    setTimeout(() => {
      html2canvas(document.querySelector(".image-preview.final"), {allowTaint: true, logging: true})
      .then(canvas => {
        analytics.logEvent("download_image_IOS") 
        const dataUrl = canvas.toDataURL()

        dispatch(downloadResultSuccess())
        return dataUrl
      })
      .then(dataUrl => {
        dispatch(doUploadImage(dataUrl))
      })
      .catch(error => {
        dispatch(downloadResultFailure())
        console.log(error)
      })
    }, 500)
  } else {
    const node = document.querySelector(`.${selectedPreview}-preview.final`)
    domtoimage.toPng(node)
    .then (function (dataUrl) {
      analytics.logEvent("download_image")

      dispatch(downloadResultSuccess())
      return dataUrl
    })
    .then(dataUrl => {
      dispatch(doUploadImage(dataUrl))
    })
    .catch(error => {
      dispatch(downloadResultFailure())
      dispatch(setErrorMessage("There was an error downloading the Image, Please try again"))
      console.log(error)
    })
  }
}

export default {
  doUploadImage,
  doSetImage,
  doSetPreviewText,
  doSetPreviewBoldText,
  doSetPreviewBackground,
  doSetActivePreview,
  doSetPreviewMode,
  doResetChanges,
  doDownloadImage
}