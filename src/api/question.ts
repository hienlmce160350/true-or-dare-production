import { HOST_API } from "@/config-global";
import { filterQuestionRequest, Question } from "@/types/question/question";
import { endpoints, fetcher } from "@/utils/axios";
import { buildURL } from "@/utils/build-url";
import { createQueryKeys } from "@/utils/react-query/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const questionQueryKeys = createQueryKeys(["questions"], {
  list: (request: filterQuestionRequest) => ({
    key: [request],
  }),
});

export function useGetquestionListQuery(request: filterQuestionRequest) {
  const validationFilter = {
    ...(request.filter?.mode ? { mode: request.filter.mode } : {}),
    ...(request.filter?.type ? { type: request.filter.type } : {}),
    ...(request.filter?.difficulty
      ? { difficulty: request.filter.difficulty }
      : {}),
    ...(request.filter?.age_group ? { mode: request.filter.age_group } : {}),
  };

  const url = buildURL({
    baseURL: HOST_API + endpoints.question.list,
    filters: validationFilter,
  });

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: questionQueryKeys.list(request).key,
    queryFn: () => fetcher(url),
  });

  const memoizedValue = useMemo(
    () => ({
      questions: (data?.data as Question[]) || [],
      questionsLoading: isLoading,
      questionsError: error,
      questionsEmpty: !isLoading && !data?.questions?.length,
      isError,
      questionTableRefetch: refetch,
    }),
    [data, isLoading, error, isError, refetch]
  );
  return memoizedValue;
}
