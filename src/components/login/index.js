import React, {Component} from 'react';
import $ from 'jquery'
import './login.css';

class Login extends Component {
  constructor(){
    super()
  }

  handleClick(){
    $.ajax({
      url:`/?accountNum=${this.refs.accountNum.value}&password=${this.refs.password.value}`,
      type: 'get',
      success: function(res){
        if(res.startsWith('/main')){
          window.location.href=res
        }else{
          alert(res)
        }
      },
      error: function(err){
        alert(err)
      }
    })
  }

  render(){
    return (
      <div className='login'>
        <div className="loginContainer">
        <input className="loginInput" ref='accountNum' type='text' placeholder='请输入账号'/>
        <input className="loginInput" ref='password' placeholder='请输入密码' type='text' />
        <button className="loginButton" onClick={this.handleClick.bind(this)}>登录</button>
        </div>
      </div>
    );
  }
}

export default Login;
