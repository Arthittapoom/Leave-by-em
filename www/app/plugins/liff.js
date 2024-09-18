import liff from '@line/liff'

export default async ({ app }, inject) => {
  try {
    await liff.init({ liffId: process.env.LIFF_ID })
    inject('liff', liff)
  } catch (error) {
    console.error('LIFF initialization failed', error)
  }
}