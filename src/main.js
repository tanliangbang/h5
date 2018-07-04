import './css/index.scss'
import './js/jquery'
import './js/gt'
import md5 from './js/md5'

import axios from 'axios'

let phone,password,code,isSendCode,captchaObjVal,tokenId
$(document).ready(function(){
    init()
   $('.from').keyup(function(){
       getVal()
        if(checkPhone()&&checkPass()&&checkPhoneCode()){
            $('.pass').css("display","block")
            $('.unpass').css("display","none")
        } else {
            $('.pass').css("display","none")
            $('.unpass').css("display","block")
        }
    })

    $('.ok').click(function(){
        let params = {
            mobile: phone,
            tokenId: tokenId,
            code: code,
            pass: md5.hex_md5(password)
        }
        $('.pass').css('display','none')
        $('.unpass').css('display','block')
        axios.post('/api/v1/tokens/mobiles',params).then(function(res){
            if(res.status === 200){
                $('.page').css('display','none')
                $('.success').css('display','block')
            }
        }).catch(function(res){
            $('.pass').css('display','none')
            $('.error').removeClass('hide')
            $('.error').text('注册失败')
        })
    })

})

async function init(){
    let data  = await axios.get('/api/v1/tokens/geeTestInit');
    $('.getCodeBtn').click(function () {
        getVal()
        if(checkPhone()&&!isSendCode){
            captchaObjVal.verify()
        }
    })
    data = data.data.data
    initGeetest({
        // 以下配置参数来自服务端 SDK
        gt: data.gt,
        challenge: data.challenge,
        offline: !data.success,
        new_captcha: data.new_captcha,
        product: 'bind'
    }, function (captchaObj) {
        captchaObjVal = captchaObj
        captchaObj.onSuccess(function () {
            let result = captchaObj.getValidate()
            result.mobile = phone
            result.gee_token = data.gee_token
            isSendCode = true
            let number = 60
            $('.getCodeBtn').text('再次获取 '+ number)
            let cuntDown = setInterval(function () {
                if (number <= 0) {
                    $('.getCodeBtn').text('再次获取')
                    clearInterval(cuntDown)
                    isSendCode = false
                } else {
                    number = --number
                    $('.getCodeBtn').text('再次获取 '+ number)
                }
            }, 1000)
            axios.post('/api/v1/tokens/sms',result).then(function(res){
               if(res.status === 200){
                   tokenId = res.data.data.tokenId
               }
            }).catch(function(res){
                let error = res.response.data
                clearInterval(cuntDown)
                $('.getCodeBtn').text('再次获取')
                isSendCode = false
                if(error.status === 409) {
                    $('.error').removeClass('hide')
                    $('.error').text('手机号码已注册')
                }else {
                    $('.error').removeClass('hide')
                    $('.error').text('发送失败')
                }
            })


        })
    })
}

function getVal() {
    phone = $('.phone').val()
    password = $('.password').val()
    code = $('.code').val()
}

function checkPass() {
    let reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/)
    if (password === '') {
        return false
    } else if (password < 6) {
        return false
    } else if (!reg.test(password)) {
        return false
    } else {
        return true
    }
}

function isPoneAvailable(phone) {
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/
    if (!myreg.test(phone)) {
        return false
    } else {
        return true
    }
}

function checkPhone() {
    if (phone === '') {
        return false
    }
    if (!isPoneAvailable(phone)) {
        return false
    } else {
        return true
    }
}


function checkPhoneCode() {
    if (code === '') {
        return false
    } else {
        return true
    }
}