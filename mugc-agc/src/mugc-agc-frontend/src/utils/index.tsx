
// 读取存储的值
export const readStorage = (key: string): string | undefined => {
  const r = localStorage.getItem(key);
  if (r == null) return undefined;
  return r;
};

// 写入值
export const writeStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

// 写入值
export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};
// 固定保留8位小数
export const fmtUvBalanceFull = (balance: string | number) => {
  if (typeof balance === 'number') {
    if (balance < 100000000) {
      return (balance / 100000000).toFixed(8)
    } else {
      let x: string = balance.toString();
      let z: number = Math.floor(balance / 100000000);
      return z.toLocaleString('en-US') + '.' + x.substring(x.length - 8);
    }
  } else {
    if (balance.length < 9) {
      return (parseInt(balance) / 100000000).toFixed(8)
    } else {
      let z = parseInt(balance.substring(0, balance.length - 8))
      return z.toLocaleString('en-US') + '.' + balance.substring(balance.length - 8);
    }
  }
}
// 有小数则显示，可不足8位小数
export const fmtUvBalance = (balance: string | number) => {
  if (typeof balance === 'number') {
    if (balance < 100000000) {
      return fmtDecimal(balance)
    } else {
      let z: number = Math.floor(balance / 100000000)
      let r = z.toLocaleString('en-US')
      let xs = balance - z * 100000000
      let xsStr = fmtDecimal(xs)
      let dot = xsStr.indexOf('.')
      if (dot > 0) {
        r += xsStr.substring(dot)
      }
      return  r;
    }
  } else {
    if (balance.length < 9) {
      return fmtDecimal(parseInt(balance))
    } else {
      let z = parseInt(balance.substring(0, balance.length - 8))
      let r = z.toLocaleString('en-US')
      let xs = parseInt(balance.substring(balance.length - 8))
      let xsStr = fmtDecimal(xs)
      let dot = xsStr.indexOf('.')
      if (dot > 0) {
        r += xsStr.substring(dot)
      }
      return r;
    }
  }
}
const fmtDecimal = (n: number) => {
  if (n === 0) {
    return '0'
  } else if (n < 100) {
    let s = n.toString()
    let r = s.length === 1 ? '0.0000000' + s : '0.000000' + s
    if (r.substring(9) === '0') {
      return r.substring(0, 9)
    }
    return r
  } else {
    return (n / 100000000).toString()
  }
}
// 每3位一个逗号
export const fmtInt = (data: number) => {
  return data.toLocaleString('en-US');
}
export const fmtTimestamp = (time: number) => {
  let t = time.toString().length > 13 ? Math.floor(time / 1000) : time
  let r = new Date(t).toISOString()
  r = r.substring(0, 10) + ', ' + r.substring(11, 19) + ' UTC';
  let now = Date.now()
  if (now - t <= 60000) {
    r += ', justnow'
  } else if (now - t <= 3600000) {
    r += ', ' + Math.floor((now - t) / 60000) + ' min ago'
  } else if (now - t <= 86400000) {
    r += ', ' + Math.floor((now - t) / 3600000) + ' hour ago'
  }
  // return new Date(t).toISOString()
  // return new Date(t).toLocaleString()

  return r
}

export const fmtSummaryAddr = (addr: string) => {
  if (!addr) {
    return '--'
  }
  if (addr.length <= 14) {
    return addr
  }
  return addr.substring(0, 11) + '...' + addr.substring(addr.length - 3)
}
