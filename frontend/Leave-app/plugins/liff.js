import liff from '@line/liff'

export default async ({ app }, inject) => {
  try {
    await liff.init({ liffId: '2006024024-GeOZxLep' })
    inject('liff', liff)
  } catch (error) {
    console.error('LIFF initialization failed', error)
  }
}