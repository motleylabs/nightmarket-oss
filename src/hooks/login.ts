import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useMemo } from 'react'

type OnLoginFn = () => Promise<void>

export default function useLogin(): OnLoginFn {
  const { wallet, connect } = useWallet()
  const { setVisible } = useWalletModal()

  const onOpenModal: OnLoginFn = useMemo(() => {
    return async function () {
      setVisible(true)

      return Promise.resolve()
    }
  }, [setVisible])

  const onConnect: OnLoginFn = useMemo(() => {
    if (wallet === null) {
      return onOpenModal
    }

    return connect
  }, [wallet, connect, onOpenModal])


  return onConnect
}