/**
 * Token 失效 / 未登录时统一清会话并进入登录页（避免 Tab 栈上 navigateTo 回不去）
 */

let redirectScheduled = false

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/send-code', '/auth/wx-login']

export function shouldSkipAuthRedirect(config) {
  const url = String(config?.url || config?.fullPath || '')
  return PUBLIC_AUTH_PATHS.some((p) => url.includes(p))
}

export function isUnauthorizedCode(code) {
  const n = Number(code)
  return n === 401
}

/**
 * @param {object} [config] luch-request 的 config，用于排除登录/注册等公开接口
 * @param {string} [message] 提示文案
 */
export function scheduleRelogin(config, message) {
  if (redirectScheduled) return
  if (config && shouldSkipAuthRedirect(config)) return

  redirectScheduled = true
  try {
    uni.removeStorageSync('access-token')
    uni.removeStorageSync('userInfo')
  } catch (e) {}

  const tip = message || '登录已过期，请重新登录'
  uni.showToast({ title: tip, icon: 'none', duration: 2000 })

  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login',
      complete: () => {
        setTimeout(() => {
          redirectScheduled = false
        }, 800)
      }
    })
  }, 500)
}
