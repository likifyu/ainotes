/**
 * 认证模态框组件
 * 支持手机号/邮箱登录和验证码验证
 */

import React, { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'verify';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { theme, setAuthenticated, setUserPhone, setUserEmail } = useStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 发送验证码
  const sendCode = useCallback(async () => {
    if (!phone && !email) {
      setError('请输入手机号或邮箱');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 模拟发送验证码（实际应调用后端 API）
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCodeSent(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [phone, email]);

  // 验证验证码
  const verifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 模拟验证（实际应调用后端 API）
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 验证成功
      if (phone) {
        setUserPhone(phone);
      }
      if (email) {
        setUserEmail(email);
      }
      setAuthenticated(true);
      onClose();
    } catch (err) {
      setError('验证码错误，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, phone, email, setAuthenticated, setUserPhone, setUserEmail, onClose]);

  // 重置表单
  const resetForm = useCallback(() => {
    setMode('login');
    setPhone('');
    setEmail('');
    setVerificationCode('');
    setCodeSent(false);
    setCountdown(0);
    setError(null);
  }, []);

  // 关闭时重置
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div
        className={`
          fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-full max-w-md rounded-2xl shadow-2xl z-50 overflow-hidden
          ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}
        `}
      >
        {/* 头部 */}
        <div className={`
          px-6 py-4 border-b flex items-center justify-between
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? '登录 / 注册' : '输入验证码'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {mode === 'login' ? (
            <>
              {/* 输入手机号或邮箱 */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    手机号
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    className={`
                      w-full px-4 py-3 rounded-lg outline-none
                      ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                      border focus:border-violet-500
                    `}
                  />
                </div>

                <div className="text-center text-sm text-gray-500">
                  或
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className={`
                      w-full px-4 py-3 rounded-lg outline-none
                      ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                      border focus:border-violet-500
                    `}
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* 发送验证码按钮 */}
              <button
                onClick={sendCode}
                disabled={isLoading || (!phone && !email)}
                className={`
                  w-full mt-6 py-3 rounded-lg text-white font-medium
                  transition-all
                  ${isLoading || (!phone && !email)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'}
                `}
              >
                {isLoading ? '发送中...' : '获取验证码'}
              </button>
            </>
          ) : (
            <>
              {/* 显示手机号/邮箱 */}
              <div className={`text-center mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {phone ? `验证码已发送至 ${phone}` : `验证码已发送至 ${email}`}
              </div>

              {/* 输入验证码 */}
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入6位验证码"
                className={`
                  w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg outline-none
                  ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                  border focus:border-violet-500
                `}
                maxLength={6}
              />

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* 重新发送 */}
              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <span className="text-gray-500">
                    {countdown}秒后可重新发送
                  </span>
                ) : (
                  <button
                    onClick={sendCode}
                    className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    重新发送验证码
                  </button>
                )}
              </div>

              {/* 验证按钮 */}
              <button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className={`
                  w-full mt-6 py-3 rounded-lg text-white font-medium
                  transition-all
                  ${isLoading || verificationCode.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'}
                `}
              >
                {isLoading ? '验证中...' : '确 定'}
              </button>
            </>
          )}
        </div>

        {/* 底部提示 */}
        <div className={`
          px-6 py-3 text-xs text-center border-t
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}
        `}>
          登录即表示同意
          <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">服务条款</a>
          和
          <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">隐私政策</a>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
