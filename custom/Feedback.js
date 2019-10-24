var data = {
	exitLogin: {
		ret: "0",
		msg: "退出登录成功"
	},
	logined: {
		ret: "0",
		msg: "已登录"
	},
	loginSuccess: {
		ret: "0",
		msg: "登录成功"
	},
	loginFailed: {
		ret: "1",
		msg: "登录失败"
	},
	signFaileForTimeout: {
		ret: "2",
		msg: "签名失败, 因为登录时间超时"
	},
	userNotExist: {
		ret: "2",
		msg: "登录失败，账号不存在，或密码错误"
	},
	paramsError: {
		ret: "1",
		msg: "请求参数错误"
	},
	sendSmsSuccess: {
		ret: "0",
		msg: "短信验证码发送成功"
	},
	noLogining: {
		ret: "2",
		msg: "未登录"
	},
	checkCodeError: {
		ret: "1",
		msg: "图片验证码输入有误"
	},
	noCallback: {
		ret: "3",
		msg: "缺少callback参数"
	},
	registerSuccess: {
		ret: "0",
		msg: "注册成功"
	},
	registerFailded: {
		ret: "1",
		msg: "注册失败"
	},
	registerParamsError: {
		ret: "1",
		msg: "注册失败，缺少必要参数"
	},
	changePasswordParamsError: {
		ret: "1",
		msg: "修改密码失败，缺少必要参数"
	},
	changePasswordParamsFailed: {
		ret: "2",
		msg: "修改密码失败，该号码没有对应的账号，您可以注册新账号"
	},
	changePasswordSuccess: {
		ret: "0",
		msg: "修改密码成功"
	},
	numberExists: {
		ret: "1",
		msg: "注册失败，电话号码已经存在"
	},
	smsCodeError: {
		ret: "1",
		msg: "注册失败，短信验证码不正确"
	},
	registerDup: {
		ret: "1",
		msg: "账号重名"
	},
}

exports.data = data;