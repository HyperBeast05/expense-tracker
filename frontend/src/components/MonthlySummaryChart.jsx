import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
};

const formatMonth = (month) => {
  if (!month) return "";

  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

const MonthlySummaryChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    income: Number(item.totalIncome ?? 0),
    expenses: Number(item.totalExpenses ?? 0),
  }));

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-1">Monthly Income vs Expenses</h5>

        <p className="text-muted small mb-4">
          Compare your income and spending over time.
        </p>

        {chartData.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
            <p className="fw-semibold mb-1">No monthly data yet</p>

            <p className="text-muted small mb-0">
              Add transactions to see your monthly financial trends.
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)}`
                  }
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                  }}
                />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#108754"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={32}
                />

                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#3c3545"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlySummaryChart;
