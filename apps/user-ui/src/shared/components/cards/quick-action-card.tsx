import { ComponentType } from "react"

interface QuickActionCardProps {
  Icon: ComponentType<any>;
  title: string;
  description: string;
}


const QuickActionCard = ({ Icon, title, description }: QuickActionCardProps) => {
  return (
    <div className="bg-white cursor-pointer p-4 rounded-md shadow-sm border border-gray-100 flex items-start gap-4">
      <Icon className="size-6 text-blue-500 my-auto" />
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}
export default QuickActionCard