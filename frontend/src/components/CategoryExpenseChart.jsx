import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";

const COLORS = [
  "#0d6efd",
  "#dc3545",
  "#198754",
  "#fd7e14",
  "#6f42c1",
  "#20c997",
  "#d63384",
  "#6c757d",
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
};

const CategoryExpenseChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.categoryName,
    amount: Number(item.totalAmount ?? 0),
  }));

  const totalExpenses = chartData.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const hasData = totalExpenses > 0;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-1">Expenses by category</h5>

        <p className="text-muted small mb-4">
          See how your spending is distributed across categories.
        </p>

        {!hasData ? (
          <div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
            <p className="fw-semibold mb-1">No expense data yet</p>

            <p className="text-muted small mb-0">
              Add expense transactions to see your category breakdown.
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={0}
                  stroke="none"
                  shape={(props) => {
                    const { index, ...rest } = props;

                    return (
                      <Sector {...rest} fill={COLORS[index % COLORS.length]} />
                    );
                  }}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                  }}
                />

                <Legend
                  position="bottom"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: "13px" }}
                  content={({ payload = [] }) => (
                    <ul className="d-flex justify-content-center flex-wrap gap-3 list-unstyled mb-0">
                      {payload.map((entry, index) => (
                        <li
                          key={`${entry.value}-${index}`}
                          className="d-flex align-items-center gap-2"
                          style={{ fontSize: "13px" }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "12px",
                              height: "12px",
                              borderRadius: "3px",
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span>{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                />

                <text
                  x="50%"
                  y="43%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6c757d"
                  fontSize="12"
                >
                  Total expenses
                </text>

                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#212529"
                  fontSize="15"
                  fontWeight="bold"
                >
                  {formatCurrency(totalExpenses)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
export default CategoryExpenseChart;
