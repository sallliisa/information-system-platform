export const _appConfig = {
  get: async function (configName: string) {
    try {
      return (await import(`../app/configs/${configName}.ts`)).default
    } catch (err) {}
  },
}
