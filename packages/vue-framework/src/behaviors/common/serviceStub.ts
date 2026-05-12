const makeMethod = (name: string) => async (..._args: any[]): Promise<any> => {
  throw new Error(
    `[vue-framework] ${name} is not implemented yet. Install framework services later or pass explicit handler props.`
  )
}

const serviceStub = {
  list: makeMethod('services.list'),
  dataset: makeMethod('services.dataset'),
  detail: makeMethod('services.detail'),
  get: makeMethod('services.get'),
  post: makeMethod('services.post'),
  put: makeMethod('services.put'),
  patch: makeMethod('services.patch'),
  delete: makeMethod('services.delete'),
  create: makeMethod('services.create'),
  update: makeMethod('services.update'),
  remove: makeMethod('services.remove'),
  raw: makeMethod('services.raw'),
  downloadFile: makeMethod('services.downloadFile'),
  upload: makeMethod('services.upload'),
  fileUpload: makeMethod('services.fileUpload'),
  fileUploadNoAuth: makeMethod('services.fileUploadNoAuth')
}

export default serviceStub
