import 'package:equatable/equatable.dart';
import 'search_filters.dart';

export 'search_filters.dart';

enum SearchStatus { loading, loaded, failure }

class SearchState extends Equatable {
  const SearchState({
    this.query = '',
    this.status = SearchStatus.loading,
    this.found = const [],
    this.filters = const SearchFilters(),
    this.errorMessage,
  });

  final String query;
  final SearchStatus status;

  /// Everything the server found, before [filters] narrow and sort it.
  final List<SearchResult> found;
  final SearchFilters filters;
  final String? errorMessage;

  /// What the list shows: [found], filtered and sorted.
  List<SearchResult> get results => filters.apply(found);

  SearchState copyWith({
    String? query,
    SearchStatus? status,
    List<SearchResult>? found,
    SearchFilters? filters,
    String? Function()? errorMessage,
  }) {
    return SearchState(
      query: query ?? this.query,
      status: status ?? this.status,
      found: found ?? this.found,
      filters: filters ?? this.filters,
      // A function so it can be set back to null.
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [query, status, found, filters, errorMessage];
}
