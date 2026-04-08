<template>
    <view class="auth-badge" @tap="$emit('tap')">
      <text class="auth-badge-text">ECNU已认证</text>
    </view>
  </template>
  
  <script>
  export default {
    name: 'AuthStatus'
  }
  </script>
  
  