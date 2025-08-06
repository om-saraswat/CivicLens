import { dbConnect } from "../../../lib/mongodb";
import Complaint from "../../../models/Complaints";
import { notFound } from "next/navigation";
import Sidebar from "../../Components/Sidebar"; // adjust if path differs

export async function generateMetadata({ params }) {
  return {
    title: `Complaint ${params.id}`,
  };
}

export default async function ComplaintDetailPage({ params }) {
  const { id } = params;

  await dbConnect();

  let complaint;
  try {
    complaint = await Complaint.findById(id).lean();
    if (!complaint) return notFound();
  } catch (err) {
    console.error("Error fetching complaint:", err);
    return notFound();
  }

  return (
    <main className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8 border-b pb-4 border-gray-700">
          Complaint Details
        </h1>

        <section className="bg-gray-900 p-6 sm:p-8 rounded-xl shadow-xl space-y-5 max-w-4xl">
          <DetailRow label="Subject" value={complaint.subject} />
          <DetailRow label="Complaint No" value={`#${complaint.complaintNo}`} />
          <DetailRow label="Description" value={complaint.description} />
          <DetailRow label="Location" value={complaint.location || "Not provided"} />
          <DetailRow label="Department" value={complaint.deptName} />
          <DetailRow label="Department Email" value={complaint.deptMail} />
          <DetailRow
            label="Status"
            value={
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                  complaint.status === "Pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : complaint.status === "In Progress"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {complaint.status}
              </span>
            }
          />
          <DetailRow
            label="Created At"
            value={new Date(complaint.createdAt).toLocaleString()}
          />

          {complaint.image && (
            <div>
              <p className="font-semibold text-lg mb-2">Attached Image</p>
              <img
                src={complaint.image}
                alt="Complaint"
                className="rounded-lg border border-gray-700 shadow-md max-w-xs"
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <p className="text-gray-400 font-medium w-36">{label}:</p>
      <p className="text-white">{value}</p>
    </div>
  );
}