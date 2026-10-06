import 'package:equatable/equatable.dart';

enum SubmitStatus { idle, submitting, success, failure }

/// State for a screen that sends one form (edit profile, change password...).
///
/// [data] is what the server returned on success (e.g. the updated user) and
/// [message] is the server's message, for the snackbar.
class SubmitState<T> extends Equatable {
  const SubmitState({this.status = SubmitStatus.idle, this.data, this.message});

  final SubmitStatus status;
  final T? data;
  final String? message;

  bool get isSubmitting => status == SubmitStatus.submitting;

  @override
  List<Object?> get props => [status, data, message];
}
