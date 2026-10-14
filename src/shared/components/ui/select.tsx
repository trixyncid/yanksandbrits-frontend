import {
  Children,
  Fragment,
  isValidElement,
  useMemo,
  type ChangeEvent,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

import { cn } from '../../lib/cn'
import { DropdownSelect, type DropdownOption } from './dropdown-select'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value'> & {
  value?: string | number
  containerClassName?: string
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children)
  }
  return ''
}

/** Flattens <option> children (including ones inside fragments and arrays). */
function collectOptions(children: ReactNode, into: DropdownOption[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type === Fragment) {
      collectOptions((child.props as { children?: ReactNode }).children, into)
      return
    }
    if (child.type === 'option') {
      const props = child.props as OptionHTMLAttributes<HTMLOptionElement> & {
        children?: ReactNode
      }
      const text = textOf(props.children)
      into.push({
        value: props.value == null ? text : String(props.value),
        label: props.children ?? text,
        text,
        disabled: props.disabled,
      })
    }
  })
  return into
}

/**
 * Drop-in replacement for the native <select>: same props and `<option>`
 * children, rendered as the app's brand dropdown. `onChange` receives an
 * event-shaped object, so `event.target.value` keeps working.
 */
export function Select({
  className,
  containerClassName,
  children,
  value,
  onChange,
  disabled,
  id,
  'aria-label': ariaLabel,
}: SelectProps) {
  const options = useMemo(() => collectOptions(children), [children])
  const current = value == null ? '' : String(value)

  return (
    <div
      className={cn(
        'relative flex w-full min-w-44 sm:w-auto',
        containerClassName,
      )}
    >
      <DropdownSelect
        id={id}
        value={current}
        options={options}
        disabled={disabled}
        ariaLabel={ariaLabel}
        className={className}
        onValueChange={(next) => {
          const target = { value: next } as HTMLSelectElement
          onChange?.({
            target,
            currentTarget: target,
          } as ChangeEvent<HTMLSelectElement>)
        }}
      />
    </div>
  )
}
