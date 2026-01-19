import { useToastContext } from '../components/ui/ToastProvider'

export const useToast = () => {
  const { addToast } = useToastContext()
  return addToast
}

export default useToast
