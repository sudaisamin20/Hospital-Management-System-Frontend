import React from "react";

interface IStatsCardProps {
  statType?: string;
  index: number;
  label: string;
  label2?: string;
  value: number | string | undefined;
  color: string;
  icon: React.ElementType;
  icon2?: React.ElementType | undefined;
}

const StatsCard = (props: IStatsCardProps) => {
  const { statType, index, label, label2, value, color, icon, icon2 } = props;
  const Icon = icon;
  const Icon2 = icon2;
  return statType === "dashboard" ? (
    <div
      className={`bg-${color}-100 rounded-lg shadow-lg p-4 text-${color}-700`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-${color}-300 bg-opacity-30 p-2 rounded-full`}>
          <Icon className="h-5 w-5" />
        </div>
        {Icon2 && <Icon2 className="h-5 w-5 opacity-70" />}
      </div>
      <p className={`text-${color}-700 text-sm font-medium`}>{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className={`text-${color}-700 text-xs mt-2`}>{label2}</p>
    </div>
  ) : (
    <div
      key={index}
      className={`bg-${color}-100 rounded-lg shadow-sm px-4 py-3 flex items-center justify-between`}
    >
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className={`text-lg font-bold text-${color}-700 mt-1`}>{value}</p>
      </div>
      <div className={`bg-${color}-300 p-2 rounded-full`}>
        <Icon className={`h-5 w-5 text-${color}-700`} />
      </div>
    </div>
  );
};

export default StatsCard;
