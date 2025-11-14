import { cn } from "@/lib/utils"
import { Input } from "../ui/input"

const InputField = ({ name, label, placeholder, type ="text", register, error, validation, disabled, value} : FormInputProps) => {
  return (
    <div className="space-y-2">
        <label htmlFor={name} className="form-label">
            {label}
        </label>
        <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            defaultValue={value}
            className={ cn('form-input', { 'opacity-50 cursor-not-allowed': disabled})}
            {...register(name, validation)}
        />
        {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}

export default InputField