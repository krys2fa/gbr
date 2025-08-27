import {
  HeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/TableSkeleton";

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton />
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
